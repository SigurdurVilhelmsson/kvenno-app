import { FileContent, AnalysisResult, StudentFeedback, ExperimentConfig, AppMode } from '@/types';
import { buildTeacherSystemPrompt, buildStudentSystemPrompt } from '@/config/prompts';

const API_TIMEOUT = 90000; // 90 seconds

// Anthropic API response types
interface AnthropicTextContent {
  type: 'text';
  text: string;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: AnthropicTextContent[];
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Build Claude API message content from file content
 */
const buildMessageContent = (content: FileContent) => {
  if (content.type === 'image') {
    return [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: content.mediaType!,
          data: content.data,
        },
      },
      {
        type: 'text',
        text: 'Read this lab report and analyze it.',
      },
    ];
  }

  if ((content.type === 'pdf' || content.type === 'docx') && content.images && content.images.length > 0) {
    // For PDFs and DOCX with images, send both text and images to Claude
    return [
      {
        type: 'text',
        text: `Lab report text content:\n\n${content.data}`,
      },
      ...content.images.map((img) => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType,
          data: img.data,
        },
      })),
      {
        type: 'text',
        text: 'Analyze this lab report including any equations or diagrams visible in the images.',
      },
    ];
  }

  // Text content
  return content.data;
};

/**
 * Call Claude API via backend server (PRODUCTION)
 * or directly (DEVELOPMENT ONLY)
 *
 * ⚠️ SECURITY WARNING ⚠️
 * Production deployments MUST use backend server (VITE_API_ENDPOINT)
 * Direct API mode exposes API keys in client code - use only for local development
 * See KVENNO-STRUCTURE.md Section 3 for security requirements
 */
export const analyzeWithClaude = async (
  content: FileContent,
  experiment: ExperimentConfig,
  mode: AppMode,
  apiKey?: string
): Promise<AnthropicResponse> => {
  const systemPrompt =
    mode === 'teacher'
      ? buildTeacherSystemPrompt(experiment)
      : buildStudentSystemPrompt(experiment);

  const messageContent = buildMessageContent(content);

  // Both modes need sufficient tokens for detailed feedback on long reports
  // Increased to 8192 to handle complex reports without truncation
  const maxTokens = 8192;

  // ALWAYS prefer backend endpoint for security
  const backendEndpoint = import.meta.env.VITE_API_ENDPOINT;
  const useDirectAPI = !backendEndpoint;

  if (useDirectAPI) {
    // ⚠️ DEVELOPMENT ONLY - Direct API call
    // This mode exposes API keys in the client bundle - NEVER use in production!
    console.warn(
      '⚠️ WARNING: Using direct API mode. This is insecure and should only be used for local development. ' +
      'Set VITE_API_ENDPOINT in .env to use secure backend server. See KVENNO-STRUCTURE.md Section 3.'
    );

    const key = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        'API key not configured. For production, set VITE_API_ENDPOINT to use backend server. ' +
        'For development only, you can set VITE_ANTHROPIC_API_KEY (NOT recommended for production).'
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: maxTokens,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `API request failed (${response.status} ${response.statusText}): ${error.error?.message || 'Unknown error'}`
      );
    }

    return await response.json();
  } else {
    // Backend server call (SECURE - recommended for production)
    const response = await fetch(`${backendEndpoint}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: messageContent,
        systemPrompt,
        mode,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorMessage;
      } catch {
        // If response is not JSON, use text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Ignore, use default message
        }
      }
      throw new Error(
        `API request failed (${response.status} ${response.statusText}): ${errorMessage}`
      );
    }

    return await response.json();
  }
};

/**
 * Process a single file and analyze it
 */
export const processFile = async (
  file: File,
  content: FileContent,
  experiment: ExperimentConfig,
  mode: AppMode
): Promise<AnalysisResult | StudentFeedback> => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout - skýrsla tók of langan tíma')), API_TIMEOUT)
  );

  const processPromise = async () => {
    const data = await analyzeWithClaude(content, experiment, mode);
    const resultText = data.content.find((item) => item.type === 'text')?.text || '';

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gat ekki túlkað svar frá AI');
    }

    let jsonText = jsonMatch[0];

    // JSON Repair Logic (Added Nov 2025)
    // Claude occasionally generates JSON with trailing commas or other quirks
    // This repair logic handles common issues before parsing
    try {
      // Remove trailing commas before closing brackets
      // Example: {"key": "value",} → {"key": "value"}
      //          {"array": [1, 2,]} → {"array": [1, 2]}
      jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');

      // Parse the repaired JSON
      const parsed = JSON.parse(jsonText);

      return parsed;
    } catch (parseError) {
      // Enhanced error logging for debugging JSON issues
      // Logs: original response, extracted JSON, and parse error details
      // Useful for identifying new JSON formatting issues from Claude
      console.error('JSON parsing failed. Response text:', resultText.substring(0, 500));
      console.error('Extracted JSON:', jsonText.substring(0, 500));
      console.error('Parse error:', parseError);

      throw new Error(`Gat ekki túlkað JSON svar: ${parseError instanceof Error ? parseError.message : 'Óþekkt villa'}`);
    }
  };

  const processWithResult = async () => {
    const parsed = await processPromise();

    if (mode === 'teacher') {
      return {
        filename: file.name,
        ...parsed,
        extractionDebug: content.debug, // Include debug info for troubleshooting
      } as AnalysisResult;
    } else {
      return {
        filename: file.name,
        ...parsed,
        extractionDebug: content.debug, // Include debug info for troubleshooting
      } as StudentFeedback;
    }
  };

  return await Promise.race([processWithResult(), timeoutPromise]) as AnalysisResult | StudentFeedback;
};
