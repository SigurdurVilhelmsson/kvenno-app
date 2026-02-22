import {
  buildTeacherSystemPrompt,
  buildStudentSystemPrompt,
  build2ndYearSystemPrompt,
  build2ndYearUserPrompt,
} from '@/config/prompts';
import {
  FileContent,
  AnalysisResult,
  StudentFeedback,
  ExperimentConfig,
  AppMode,
  Analysis2Result,
  ExperimentConfig2,
} from '@/types';

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

  if (
    (content.type === 'pdf' || content.type === 'docx') &&
    content.images &&
    content.images.length > 0
  ) {
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(`${backendEndpoint}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: messageContent,
        systemPrompt,
        mode,
      }),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout - skýrsla tók of langan tíma');
    }
    throw error;
  }
  clearTimeout(timeoutId);

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
  } catch (parseError) {
    // Enhanced error logging for debugging JSON issues
    // Logs: original response, extracted JSON, and parse error details
    // Useful for identifying new JSON formatting issues from Claude
    console.error('JSON parsing failed. Response text:', resultText.substring(0, 500));
    console.error('Extracted JSON:', jsonText.substring(0, 500));
    console.error('Parse error:', parseError);

    throw new Error(
      `Gat ekki túlkað JSON svar: ${parseError instanceof Error ? parseError.message : 'Óþekkt villa'}`
    );
  }
};

// ─── 2nd Year Checklist API ──────────────────────────────────────────────────

/**
 * Call Claude API for 2nd year checklist analysis via backend server.
 */
const analyzeWithClaude2 = async (
  systemPrompt: string,
  userPrompt: string
): Promise<AnthropicResponse> => {
  const backendEndpoint = import.meta.env.VITE_API_ENDPOINT;

  if (!backendEndpoint) {
    throw new Error(
      'VITE_API_ENDPOINT er ekki stillt. Settu VITE_API_ENDPOINT í .env til að vísa á bakenda.'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(`${backendEndpoint}/analyze-2ar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt }),
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout - skýrsla tók of langan tíma');
    }
    throw error;
  }
  clearTimeout(timeoutId);

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
        // Use default message
      }
    }
    throw new Error(`API villa (${response.status}): ${errorMessage}`);
  }

  return await response.json();
};

/**
 * Process a single file through the 2nd year checklist analysis.
 */
export const processFile2ar = async (
  content: FileContent,
  draftContent: string | null,
  experiment: ExperimentConfig2
): Promise<Analysis2Result> => {
  const systemPrompt = build2ndYearSystemPrompt(experiment);
  const userPrompt = build2ndYearUserPrompt(draftContent, content.data);

  const data = await analyzeWithClaude2(systemPrompt, userPrompt);
  const resultText = data.content.find((item) => item.type === 'text')?.text || '';

  const jsonMatch = resultText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Gat ekki túlkað svar frá AI');
  }

  let jsonText = jsonMatch[0];

  try {
    // Remove trailing commas before closing brackets
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
    const parsed = JSON.parse(jsonText);

    // Add metadata
    const result: Analysis2Result = {
      draftProvided: !!draftContent,
      baselineComparison: parsed.baselineComparison || undefined,
      checklist: parsed.checklist || {},
      manualChecksRequired: experiment.alwaysManualCheck,
      summaryIcelandic: parsed.summaryIcelandic || 'Engin samantekt frá AI.',
    };

    // Enrich checklist items with labels from the experiment config
    for (const [sectionKey, section] of Object.entries(experiment.checklist)) {
      if (result.checklist[sectionKey]) {
        for (const item of result.checklist[sectionKey]) {
          const configItem = section.items.find((ci) => ci.id === item.id);
          if (configItem) {
            item.label = configItem.label;
          }
          // Mark manual-only items
          if (configItem && configItem.manualRequired && item.present !== false) {
            item.present = 'needs_manual_check';
          }
        }
      }
    }

    return result;
  } catch (parseError) {
    console.error('JSON parsing failed. Response text:', resultText.substring(0, 500));
    console.error('Extracted JSON:', jsonText.substring(0, 500));
    throw new Error(
      `Gat ekki túlkað JSON svar: ${parseError instanceof Error ? parseError.message : 'Óþekkt villa'}`
    );
  }
};
