/**
 * Type definitions for the kvenno-app Express backend server.
 */

// ---------------------------------------------------------------------------
// Request / Response types for API endpoints
// ---------------------------------------------------------------------------

/** Valid modes for the /api/analyze endpoint */
export type AnalyzeMode = 'teacher' | 'student';

/** Request body for POST /api/analyze */
export interface AnalyzeRequestBody {
  content: string | unknown;
  systemPrompt: string;
  mode: AnalyzeMode;
}

/** Request body for POST /api/analyze-2ar */
export interface Analyze2arRequestBody {
  systemPrompt: string;
  userPrompt: string;
}

/** Query parameters for GET /api/islenskubraut/pdf */
export interface PdfQueryParams {
  flokkur?: string;
  stig?: string;
}

// ---------------------------------------------------------------------------
// Anthropic API types
// ---------------------------------------------------------------------------

/** A single message in the Anthropic messages API */
export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

/** A content block in an Anthropic response */
export interface AnthropicContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  [key: string]: unknown;
}

/** Full response from the Anthropic messages API */
export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

// ---------------------------------------------------------------------------
// Server response types
// ---------------------------------------------------------------------------

/** Response from GET /health */
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

/** Generic error response */
export interface ErrorResponse {
  error: string;
}

// ---------------------------------------------------------------------------
// Document processing types
// ---------------------------------------------------------------------------

/** Result from pandoc processing */
export interface PandocResult {
  content: string;
  format: 'markdown';
  equations: string[];
}

/** Response from POST /api/process-document */
export interface ProcessDocumentResponse {
  pdfData: string;
  equations: string[];
  type: 'converted-pdf';
  format: 'pdf';
}

// ---------------------------------------------------------------------------
// Íslenskubraut data types
// ---------------------------------------------------------------------------

/** A sub-category within a teaching card category */
export interface SubCategory {
  name: string;
  options: string[];
}

/** Valid CEFR levels for sentence frames */
export type CEFRLevel = 'A1' | 'A2' | 'B1';

/** A set of sentence frames for a specific CEFR level */
export interface SentenceFrame {
  level: CEFRLevel;
  frames: string[];
}

/** An answer option set for a guiding question at a specific level */
export interface GuidingQuestionAnswer {
  level: CEFRLevel;
  options: string[];
}

/** A guiding question with level-specific answer options */
export interface GuidingQuestion {
  question: string;
  icon: string;
  answers: GuidingQuestionAnswer[];
}

/** A complete teaching card category */
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  subCategories: SubCategory[];
  sentenceFrames: SentenceFrame[];
  guidingQuestions: GuidingQuestion[];
}
