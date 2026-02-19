import { buildTeacherSystemPrompt, buildStudentSystemPrompt } from '@/config/prompts';
import { FileContent, AnalysisResult, StudentFeedback, ExperimentConfig, AppMode } from '@/types';

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
 * Call Claude API via the backend server proxy.
 * Requires VITE_API_ENDPOINT to be configured.
 */
export const analyzeWithClaude = async (
  content: FileContent,
  experiment: ExperimentConfig,
  mode: AppMode
): Promise<AnthropicResponse> => {
  const systemPrompt =
    mode === 'teacher'
      ? buildTeacherSystemPrompt(experiment)
      : buildStudentSystemPrompt(experiment);

  const messageContent = buildMessageContent(content);

  const backendEndpoint = import.meta.env.VITE_API_ENDPOINT;
  if (!backendEndpoint) {
    throw new Error(
      'VITE_API_ENDPOINT is not configured. Set it in .env to point to the backend server.'
    );
  }

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
