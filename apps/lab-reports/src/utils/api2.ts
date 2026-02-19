import { build2ndYearSystemPrompt, build2ndYearUserPrompt } from '@/config/prompts2';
import { FileContent, Analysis2Result, ExperimentConfig2 } from '@/types';

const API_TIMEOUT = 90000; // 90 seconds

interface AnthropicTextContent {
  type: 'text';
  text: string;
}

interface AnthropicResponse {
  content: AnthropicTextContent[];
}

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

  const response = await fetch(`${backendEndpoint}/analyze-2ar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
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
export const processFile2 = async (
  content: FileContent,
  draftContent: string | null,
  experiment: ExperimentConfig2
): Promise<Analysis2Result> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout - skýrsla tók of langan tíma')), API_TIMEOUT)
  );

  const processPromise = async (): Promise<Analysis2Result> => {
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
            const configItem = section.items.find(ci => ci.id === item.id);
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
      throw new Error(`Gat ekki túlkað JSON svar: ${parseError instanceof Error ? parseError.message : 'Óþekkt villa'}`);
    }
  };

  return await Promise.race([processPromise(), timeoutPromise]);
};
