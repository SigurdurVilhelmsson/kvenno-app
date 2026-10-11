/**
 * Type definitions for the kvenno-app Express backend server.
 */

// ---------------------------------------------------------------------------
// Request / Response types for API endpoints
// ---------------------------------------------------------------------------

/** Valid modes for the /api/analyze endpoint */
export type AnalyzeMode = 'teacher' | 'student';

/** A content block in an Anthropic user message (image, text, etc.) */
export interface AnthropicUserContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

/** Request body for POST /api/analyze */
export interface AnalyzeRequestBody {
  content: string | AnthropicUserContentBlock[];
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
// Íslenskubraut data types — generated, identical to the app's copy
// ---------------------------------------------------------------------------

export type {
  Category,
  ContextKind,
  GuidingQuestion,
  GuidingQuestionAnswer,
  Level,
  LevelText,
  SentenceFrame,
  SubCategory,
} from './islenskubraut.js';
