/**
 * Express.js backend server for kvenno.app
 * Handles API endpoints for lab reports, PDF generation, and Íslenskubraut
 * Compatible with Ubuntu 24.04 + nginx
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { IncomingForm, type File } from 'formidable';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { unlink, readFile, rename } from 'fs/promises';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { generatePdf } from './lib/islenskubraut-pdf.js';
import { getCategoryById } from './lib/islenskubraut-data.js';
import type {
  AnalyzeRequestBody,
  Analyze2arRequestBody,
  PdfQueryParams,
  AnthropicResponse,
  HealthResponse,
  ErrorResponse,
  PandocResult,
  ProcessDocumentResponse,
} from './types/index.js';

const execFileAsync = promisify(execFile);
const app: ReturnType<typeof express> = express();
const PORT = Number(process.env.PORT) || 8000;

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration - localhost origins only in development
const allowedOrigins: (string | undefined)[] = [
  'https://kvenno.app',
  'https://www.kvenno.app',
  process.env.FRONTEND_URL,
];
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173');
}
const filteredOrigins = allowedOrigins.filter((o): o is string => Boolean(o));

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // In production, reject requests without Origin header to prevent
      // abuse from curl, extensions, and non-browser clients
      if (!origin) {
        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Origin header required'));
      }

      if (filteredOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Rate limiters
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Of margar beiðnir - reyndu aftur eftir smástund' },
});

const documentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Of margar beiðnir - reyndu aftur eftir smástund' },
});

const pdfLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Of margar beiðnir - reyndu aftur eftir smástund' },
});

// 15MB limit covers multi-page PDFs with images while preventing abuse
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Check if pandoc is available
 */
async function isPandocAvailable(): Promise<boolean> {
  try {
    await execFileAsync('pandoc', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if LibreOffice is available
 */
async function isLibreOfficeAvailable(): Promise<boolean> {
  try {
    await execFileAsync('libreoffice', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert .docx to PDF using LibreOffice (headless mode)
 */
async function convertDocxToPdf(docxPath: string): Promise<string> {
  const outputDir = path.dirname(docxPath);
  const baseName = path.basename(docxPath, '.docx');

  // LibreOffice may handle filenames with multiple dots differently
  // Expected output, but LibreOffice might create a different filename
  const expectedPdfPath = path.join(outputDir, `${baseName}.pdf`);

  console.log('[LibreOffice] Converting DOCX to PDF:', {
    input: docxPath,
    expectedOutput: expectedPdfPath,
    baseName,
  });

  try {
    const { stderr } = await execFileAsync(
      'libreoffice',
      ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, docxPath],
      { timeout: 30000 }
    );

    if (stderr && !stderr.includes('Warning')) {
      console.error('LibreOffice stderr:', stderr);
    }

    // Check if expected PDF exists
    try {
      await readFile(expectedPdfPath);
      console.log('[LibreOffice] Conversion complete (expected path):', expectedPdfPath);
      return expectedPdfPath;
    } catch {
      // Expected path doesn't exist - LibreOffice might have created a different filename
      // This can happen with filenames containing dots (e.g., "file.25.docx" -> "file.pdf")
      console.warn('[LibreOffice] Expected PDF not found, searching for created file...');

      // Try to find the PDF by looking for recently created PDF files
      // LibreOffice might strip dots from filename: "file.25.docx" -> "file.pdf"
      const { readdirSync } = await import('fs');
      const files = readdirSync(outputDir);

      // Look for PDF files that match the base name pattern
      // Try multiple patterns to handle LibreOffice's filename handling
      const baseNameFirstPart = baseName.split('.')[0];
      const possibleNames = [
        `${baseName}.pdf`, // Full name with dots
        `${baseNameFirstPart}.pdf`, // First part only (dots stripped)
      ];

      console.log('[LibreOffice] Searching for PDF in:', outputDir);
      console.log('[LibreOffice] Possible names:', possibleNames);
      console.log(
        '[LibreOffice] Found files:',
        files.filter((f: string) => f.endsWith('.pdf'))
      );

      for (const possibleName of possibleNames) {
        if (files.includes(possibleName)) {
          const actualPdfPath = path.join(outputDir, possibleName);
          console.log('[LibreOffice] Found PDF:', actualPdfPath);
          return actualPdfPath;
        }
      }

      throw new Error(
        `PDF not found after conversion. Expected one of: ${possibleNames.join(', ')}`
      );
    }
  } catch (error: unknown) {
    console.error('LibreOffice conversion error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to convert DOCX to PDF: ${message}`);
  }
}

/**
 * Process .docx file using pandoc (for equation extraction)
 */
async function processDocxWithPandoc(filePath: string): Promise<PandocResult> {
  try {
    const { stdout, stderr } = await execFileAsync('pandoc', [
      filePath,
      '--from=docx',
      '--to=markdown',
      '--wrap=none',
    ]);

    if (stderr && !stderr.includes('Warning')) {
      console.error('Pandoc stderr:', stderr);
    }

    const content = stdout;

    // Extract equations
    const equations: string[] = [];
    const inlineEquationPattern = /\$([^$]+)\$/g;
    const displayEquationPattern = /\$\$([^$]+)\$\$/g;

    let match: RegExpExecArray | null;
    while ((match = displayEquationPattern.exec(content)) !== null) {
      equations.push(match[1].trim());
    }
    while ((match = inlineEquationPattern.exec(content)) !== null) {
      if (!equations.includes(match[1].trim())) {
        equations.push(match[1].trim());
      }
    }

    return {
      content,
      format: 'markdown',
      equations,
    };
  } catch (error: unknown) {
    console.error('Pandoc processing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process document: ${message}`);
  }
}

/**
 * Parse multipart form data
 */
function parseForm(
  req: Request
): Promise<{ fields: Record<string, unknown>; files: Record<string, File | File[]> }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        fields: fields as Record<string, unknown>,
        files: files as Record<string, File | File[]>,
      });
    });
  });
}

/**
 * API endpoint: Process .docx documents
 * Converts DOCX to PDF for consistent processing across all file types
 */
app.post(
  '/api/process-document',
  documentLimiter,
  async (req: Request, res: Response<ProcessDocumentResponse | ErrorResponse>) => {
    let docxPath: string | null = null;
    let pdfPath: string | null = null;

    try {
      // Check if LibreOffice is available
      const libreOfficeAvailable = await isLibreOfficeAvailable();
      if (!libreOfficeAvailable) {
        return res.status(500).json({
          error: 'LibreOffice is not installed on this server. Please install libreoffice.',
        });
      }

      // Check if pandoc is available (for equation extraction)
      const pandocAvailable = await isPandocAvailable();
      if (!pandocAvailable) {
        console.warn('Pandoc not available - equation extraction will be skipped');
      }

      // Parse form data
      const { files } = await parseForm(req);
      const fileEntry = files.file;
      const file: File | undefined = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      docxPath = file.filepath;

      // Validate file extension from original filename
      const originalName = (file.originalFilename || '').toLowerCase();
      if (!originalName.endsWith('.docx')) {
        return res.status(400).json({ error: 'Only .docx files are supported' });
      }

      // Validate file size (10MB max, matching formidable config)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'File too large (max 10MB)' });
      }

      // Use random filename to prevent path traversal and injection
      const { randomBytes } = await import('crypto');
      const safeName = randomBytes(16).toString('hex');
      const safeDocxPath = path.join(path.dirname(docxPath), `${safeName}.docx`);
      await rename(docxPath, safeDocxPath);
      docxPath = safeDocxPath;

      console.log('[Document Processing] Starting DOCX -> PDF conversion (safe name):', safeName);

      // Extract equations from original DOCX using pandoc (best accuracy)
      let equations: string[] = [];
      if (pandocAvailable) {
        try {
          const pandocResult = await processDocxWithPandoc(docxPath);
          equations = pandocResult.equations;
          console.log('[Document Processing] Extracted equations:', equations.length);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error('[Document Processing] Equation extraction failed:', message);
          // Continue without equations - not critical
        }
      }

      // Convert DOCX to PDF using LibreOffice
      pdfPath = await convertDocxToPdf(docxPath);

      // Read PDF file as bytes
      const pdfBytes = await readFile(pdfPath);
      const pdfBase64 = pdfBytes.toString('base64');

      console.log('[Document Processing] PDF conversion complete:', {
        pdfSize: `${(pdfBytes.length / 1024).toFixed(2)} KB`,
        equations: equations.length,
      });

      // Clean up temporary files
      await unlink(docxPath);
      await unlink(pdfPath);
      docxPath = null;
      pdfPath = null;

      // Return PDF bytes for client processing
      return res.json({
        pdfData: pdfBase64,
        equations: equations,
        type: 'converted-pdf',
        format: 'pdf',
      });
    } catch (error: unknown) {
      console.error('Document processing error:', error);

      // Clean up files if they exist
      if (docxPath) {
        try {
          await unlink(docxPath);
        } catch {
          // Ignore cleanup errors
        }
      }
      if (pdfPath) {
        try {
          await unlink(pdfPath);
        } catch {
          // Ignore cleanup errors
        }
      }

      return res.status(500).json({
        error: 'Gat ekki unnið úr skjalinu. Vinsamlegast reyndu aftur.',
      });
    }
  }
);

/**
 * API endpoint: Analyze with Claude
 */
app.post(
  '/api/analyze',
  analyzeLimiter,
  async (
    req: Request<unknown, unknown, AnalyzeRequestBody>,
    res: Response<AnthropicResponse | ErrorResponse>
  ) => {
    try {
      const { content, systemPrompt, mode } = req.body;

      // Validate request
      if (!content || !systemPrompt || !mode) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (mode !== 'teacher' && mode !== 'student') {
        return res.status(400).json({ error: 'Invalid mode' });
      }

      if (typeof systemPrompt !== 'string' || systemPrompt.length > 30000) {
        return res.status(400).json({ error: 'Invalid systemPrompt' });
      }

      // Validate content field length (max ~5MB as JSON string)
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      if (contentStr.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'Content too large' });
      }

      // Get API key
      const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('API credentials not configured');
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Call Anthropic API with timeout (85s, leaving 5s buffer for 90s limit)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 85000);

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-6',
            // Increased from 2000 -> 8192 to prevent response truncation (Nov 2025)
            // Complex reports (8+ pages) with detailed feedback require more output tokens
            // Applies to both teacher and student modes
            max_tokens: 8192,
            // System prompt sent as content block with cache_control for prompt caching.
            // The system prompt (~4-5K tokens) is identical across reports in a batch,
            // so caching reduces input cost from $5/MTok to $0.50/MTok on cache hits.
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
                content: content,
              },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: { message?: string } };
          console.error('Anthropic API error:', errorData);
          return res.status(response.status).json({
            error: errorData.error?.message || 'API request failed',
          });
        }

        const data = (await response.json()) as AnthropicResponse;

        // Enhanced debug logging for troubleshooting response issues
        // Helps identify: truncation, timeout problems, token usage patterns
        // To view logs: sudo journalctl -u kvenno-backend -n 100
        // To filter: sudo journalctl -u kvenno-backend | grep "\[Analysis\]"
        const textContent = data.content?.find((c) => c.type === 'text')?.text || '';
        console.log('[Analysis] Response received:', {
          stopReason: data.stop_reason, // Why generation stopped ("end_turn" = complete, "max_tokens" = hit limit)
          textLength: textContent.length, // Total response length in characters
          textPreview: textContent.substring(0, 200), // First 200 chars for quick inspection
          textEnd: textContent.substring(textContent.length - 200), // Last 200 chars (useful for truncation detection)
          usage: data.usage, // Token usage stats (input_tokens, output_tokens)
          cacheCreated: data.usage?.cache_creation_input_tokens || 0, // Tokens written to cache (first request)
          cacheHit: data.usage?.cache_read_input_tokens || 0, // Tokens read from cache (subsequent requests)
        });

        return res.json(data);
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('Request timeout');
          return res.status(504).json({
            error: 'Request timeout - greining tok of langan tima',
          });
        }
        throw fetchError;
      }
    } catch (error: unknown) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * API endpoint: 2nd year simplified checklist analysis
 * Receives system prompt and user prompt (with optional draft comparison),
 * sends to Claude, and returns checklist results.
 */
app.post(
  '/api/analyze-2ar',
  analyzeLimiter,
  async (
    req: Request<unknown, unknown, Analyze2arRequestBody>,
    res: Response<AnthropicResponse | ErrorResponse>
  ) => {
    try {
      const { systemPrompt, userPrompt } = req.body;

      if (!systemPrompt || !userPrompt) {
        return res.status(400).json({ error: 'Missing required fields: systemPrompt, userPrompt' });
      }

      if (typeof systemPrompt !== 'string' || systemPrompt.length > 30000) {
        return res.status(400).json({ error: 'Invalid systemPrompt' });
      }

      if (typeof userPrompt !== 'string' || userPrompt.length > 100000) {
        return res.status(400).json({ error: 'Invalid userPrompt' });
      }

      const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('API credentials not configured');
        return res.status(500).json({ error: 'Internal server error' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 85000);

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-6',
            max_tokens: 8192,
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
                content: userPrompt,
              },
            ],
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: { message?: string } };
          console.error('Anthropic API error (2ar):', errorData);
          return res.status(response.status).json({
            error: errorData.error?.message || 'API request failed',
          });
        }

        const data = (await response.json()) as AnthropicResponse;

        const textContent = data.content?.find((c) => c.type === 'text')?.text || '';
        console.log('[Analysis-2ar] Response received:', {
          stopReason: data.stop_reason,
          textLength: textContent.length,
          usage: data.usage,
        });

        return res.json(data);
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('Request timeout (2ar)');
          return res.status(504).json({
            error: 'Request timeout - greining tok of langan tima',
          });
        }
        throw fetchError;
      }
    } catch (error: unknown) {
      console.error('Server error (2ar):', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * API endpoint: Generate Islenskubraut teaching card PDF
 * GET /api/islenskubraut/pdf?flokkur={categoryId}&stig={level}
 */
app.get(
  '/api/islenskubraut/pdf',
  pdfLimiter,
  async (req: Request<unknown, unknown, unknown, PdfQueryParams>, res: Response) => {
    try {
      const { flokkur, stig } = req.query;

      if (!flokkur || !stig) {
        return res.status(400).json({
          error: 'Vantar faeribreytur: flokkur og stig',
        });
      }

      // Validate flokkur against known category IDs
      const validCategoryIds = ['dyr', 'matur', 'farartaeki', 'manneskja', 'stadir', 'klaednadur'];
      if (!validCategoryIds.includes(flokkur)) {
        return res.status(400).json({
          error: `Ogilt flokkur: ${flokkur}. Leyfileg gildi: ${validCategoryIds.join(', ')}`,
        });
      }

      const validLevels = ['A1', 'A2', 'B1'];
      if (!validLevels.includes(stig)) {
        return res.status(400).json({
          error: `Ogilt stig: ${stig}. Leyfileg gildi: ${validLevels.join(', ')}`,
        });
      }

      const category = getCategoryById(flokkur);
      if (!category) {
        return res.status(404).json({
          error: `Flokkur ekki fundinn: ${flokkur}`,
        });
      }

      console.log(`[Islenskubraut PDF] Generating: flokkur=${flokkur}, stig=${stig}`);

      const pdfBuffer = await generatePdf(category, stig);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="spjald-${flokkur}-${stig}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: unknown) {
      console.error('[Islenskubraut PDF] Error:', error);
      return res.status(500).json({
        error: 'Villa vid ad bua til PDF',
      });
    }
  }
);

// Error handler
app.use((err: Error, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export app for testing
export { app };

// Only start server when run directly (not when imported for testing)
const isDirectRun =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirectRun) {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Backend API running on http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Allowed origins: ${filteredOrigins.join(', ')}`);
  });
}
