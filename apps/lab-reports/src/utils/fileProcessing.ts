/* eslint-disable no-console -- File processing utility with intentional debug logging */
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

import { FileContent } from '@/types';

// Configure PDF.js worker with smart path resolution and CDN fallback
// Import the worker URL from Vite

/**
 * Get the correct worker URL based on deployment context
 * Vite's ?url import handles base path resolution automatically
 */
const getWorkerUrl = (): string => {
  // If already an absolute URL (http/https/blob), use as-is
  if (pdfjsWorker.startsWith('http') || pdfjsWorker.startsWith('blob:')) {
    return pdfjsWorker;
  }

  // For relative paths, make absolute by prepending origin
  // Vite already includes the correct base path in the imported URL
  const fullUrl = pdfjsWorker.startsWith('/')
    ? `${window.location.origin}${pdfjsWorker}`
    : `${window.location.origin}/${pdfjsWorker}`;

  if (import.meta.env.DEV) {
    console.log('[PDF.js] Worker configured (bundled):', {
      workerUrl: fullUrl,
      originalPath: pdfjsWorker,
      origin: window.location.origin,
    });
  }

  return fullUrl;
};

/**
 * Get CDN worker URL as fallback
 * Uses exact version match for compatibility
 */
const getCdnWorkerUrl = (): string => {
  // Use cdnjs with exact version matching pdfjs-dist (4.10.38)
  const version = '4.10.38';
  const cdnUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  if (import.meta.env.DEV) console.log('[PDF.js] CDN worker URL prepared:', cdnUrl);
  return cdnUrl;
};

/**
 * Retry PDF loading with CDN worker
 * Called when bundled worker fails
 */
const retryWorkerWithCdn = async () => {
  if (import.meta.env.DEV)
    console.log('[PDF Processing] Worker error detected, retrying with CDN fallback...');
  const cdnUrl = getCdnWorkerUrl();
  pdfjsLib.GlobalWorkerOptions.workerSrc = cdnUrl;
  if (import.meta.env.DEV) console.log('[PDF.js] Worker reconfigured to CDN:', cdnUrl);
};

/**
 * Determine which worker to use based on environment
 * In production with subpaths, CDN is more reliable
 */
const selectWorkerUrl = (): string => {
  // Check if we're in a subpath deployment (base URL is not just '/')
  const baseUrl = import.meta.env.BASE_URL || '/';
  const isSubpathDeployment = baseUrl !== '/' && baseUrl.length > 1;

  // For subpath deployments, prefer CDN worker to avoid path resolution issues
  if (isSubpathDeployment && import.meta.env.PROD) {
    if (import.meta.env.DEV)
      console.log('[PDF.js] Subpath deployment detected, using CDN worker for reliability');
    return getCdnWorkerUrl();
  }

  // Otherwise, try bundled worker first
  return getWorkerUrl();
};

// Initial worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = selectWorkerUrl();

// Get API endpoint from environment or use default
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api';

// PDF.js types for text content items
interface PDFTextItem {
  str: string;
  dir?: string;
  width?: number;
  height?: number;
  transform?: number[]; // [a, b, c, d, x, y] - x and y are positions
  fontName?: string;
  hasEOL?: boolean; // End of line marker
}

/**
 * Convert a file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert base64 string to Blob
 */
const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
};

/**
 * Extract text from a Word document (.docx) using server-side conversion
 * Server converts DOCX → PDF for consistent processing with existing PDF pipeline
 */
const extractFromDocx = async (file: File): Promise<FileContent> => {
  if (import.meta.env.DEV) {
    console.log('[DOCX Processing] Starting Word document processing:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    });
  }

  // Create FormData to upload the file
  const formData = new FormData();
  formData.append('file', file);

  try {
    if (import.meta.env.DEV)
      console.log('[DOCX Processing] Sending to server for DOCX → PDF conversion...');

    // Send to server for processing
    const response = await fetch(`${API_ENDPOINT}/process-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('[DOCX Processing] Server returned error:', {
        status: response.status,
        statusText: response.statusText,
      });

      const error = await response.json();
      throw new Error(error.error || 'Failed to process document');
    }

    const result = await response.json();

    if (import.meta.env.DEV) {
      console.log('[DOCX Processing] Document processed successfully:', {
        type: result.type,
        format: result.format,
        equationCount: result.equations?.length || 0,
        hasPdfData: !!result.pdfData,
      });
    }

    // Server now returns PDF bytes for consistent processing
    if (result.pdfData) {
      if (import.meta.env.DEV)
        console.log('[DOCX Processing] Converting PDF bytes to File object...');

      // Convert base64 PDF to Blob
      const pdfBlob = base64ToBlob(result.pdfData, 'application/pdf');
      const pdfFile = new File([pdfBlob], file.name.replace('.docx', '.pdf'), {
        type: 'application/pdf',
      });

      if (import.meta.env.DEV) {
        console.log('[DOCX Processing] Processing converted PDF:', {
          pdfSize: `${(pdfFile.size / 1024).toFixed(2)} KB`,
        });
      }

      // Process using existing PDF pipeline - ensures consistent results
      // Mark as docx-converted-pdf for debugging
      const pdfContent = await extractFromPdf(pdfFile, 'docx-converted-pdf');

      // Add equation metadata from server (best accuracy from original DOCX)
      return {
        ...pdfContent,
        type: 'docx', // Keep original type for tracking
        equations: result.equations, // LaTeX equations from pandoc
      };
    }

    // Fallback to old behavior if server doesn't return PDF (shouldn't happen)
    console.warn('[DOCX Processing] Server did not return PDF data - using legacy response');
    return {
      type: 'docx',
      data: result.content || '',
      mediaType: 'text/markdown',
      images: result.images,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[DOCX Processing] Error processing .docx file:', {
      fileName: file.name,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Gat ekki lesið Word skjalið: ${errorMessage}`);
  }
};

/**
 * Analyze text structure for debugging
 */
const analyzeTextStructure = (text: string) => {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const totalChars = text.length;
  const whitespaceChars = (text.match(/\s/g) || []).length;

  return {
    paragraphCount: paragraphs.length,
    averageLineLength:
      nonEmptyLines.length > 0
        ? Math.round(
            nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length
          )
        : 0,
    whitespaceDensity: totalChars > 0 ? Math.round((whitespaceChars / totalChars) * 100) / 100 : 0,
  };
};

/**
 * Extract text and images from a PDF file
 * This function extracts both text content and images (including equations rendered as images)
 */
const extractFromPdf = async (
  file: File,
  extractionMethod: 'direct-pdf' | 'docx-converted-pdf' = 'direct-pdf'
): Promise<FileContent> => {
  if (import.meta.env.DEV) {
    console.log('[PDF Processing] Starting PDF extraction:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      mimeType: file.type,
      extractionMethod,
    });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (import.meta.env.DEV) {
      console.log('[PDF Processing] File loaded into memory:', {
        arrayBufferSize: `${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`,
      });
    }

    // Attempt to load PDF document with automatic retry on worker errors
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      if (import.meta.env.DEV) {
        console.log('[PDF Processing] PDF document loaded successfully:', {
          numPages: pdf.numPages,
          fingerprints: pdf.fingerprints,
        });
      }
    } catch (pdfError: unknown) {
      const errorMsg = pdfError instanceof Error ? pdfError.message : String(pdfError);
      console.error('[PDF Processing] PDF.js document loading failed (attempt 1):', {
        error: errorMsg,
        workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
        fileName: file.name,
      });

      // Check if it's a worker loading error
      if (
        errorMsg.includes('worker') ||
        errorMsg.includes('Worker') ||
        errorMsg.includes('fetch')
      ) {
        // Try with CDN fallback
        await retryWorkerWithCdn();

        try {
          pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          if (import.meta.env.DEV) {
            console.log('[PDF Processing] Successfully loaded PDF with CDN worker:', {
              numPages: pdf.numPages,
              fingerprints: pdf.fingerprints,
            });
          }
        } catch (retryError: unknown) {
          const retryMsg = retryError instanceof Error ? retryError.message : String(retryError);
          console.error('[PDF Processing] CDN worker retry also failed:', retryMsg);
          throw new Error(
            'Vandamál við að hlaða PDF vinnsluforritinu. Vinsamlegast reynið aftur eða hafið samband við stjórnanda.'
          );
        }
      } else if (errorMsg.includes('Invalid') || errorMsg.includes('corrupted')) {
        // Check if it's a corrupted PDF
        throw new Error(
          'PDF skjalið virðist vera skemmt. Vinsamlegast reynið að vista það aftur úr upprunaforritinu.'
        );
      } else {
        // Re-throw other errors with original message
        throw new Error(`Villa við að lesa PDF: ${errorMsg}`);
      }
    }

    const images: Array<{ data: string; mediaType: string }> = [];
    let fullText = '';
    let totalTextLength = 0;

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      // Extract text content with paragraph break preservation
      const textContent = await page.getTextContent();
      const items = textContent.items as PDFTextItem[];

      let pageText = '';
      let lastY = -1;
      let lastX = -1;
      let lastWidth = 0;
      let lastHeight = 0;
      const xGaps: number[] = []; // Track all X gaps for analysis

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const currentY = item.transform ? item.transform[5] : 0;
        const currentX = item.transform ? item.transform[4] : 0;
        const currentHeight = item.height || 12;
        const currentWidth = item.width || 0;

        // Detect line breaks based on y-coordinate changes
        if (lastY !== -1) {
          const yDiff = Math.abs(currentY - lastY);
          const xDiff = currentX - (lastX + lastWidth);

          // Large y-difference indicates paragraph break (more than 1.5x line height)
          if (yDiff > lastHeight * 1.5) {
            pageText += '\n\n';
          }
          // Line break detection - different strategies per extraction method
          else if (extractionMethod === 'direct-pdf') {
            // For direct PDFs with character-level encoding: ANY Y-change = new line
            // This catches even tightly-spaced table rows (< 1 unit apart)
            if (yDiff > 0) {
              pageText += '\n';
            }
          }
          // DOCX-converted PDFs use standard threshold
          else if (yDiff > lastHeight * 0.3) {
            pageText += '\n';
          }
          // Same line - character-level PDFs encode each character separately
          // Don't add spaces based on X-coordinates - let PDF.js handle it
          else {
            // For character-level PDFs, text items often include spaces naturally
            // Only add space if the current item starts with space OR there's a large gap
            // This prevents "L e  C h a t e l i e r" while preserving word spacing
            if (xDiff > 0) {
              xGaps.push(xDiff);
            }
          }
        }

        pageText += item.str;
        lastY = currentY;
        lastX = currentX;
        lastWidth = currentWidth;
        lastHeight = currentHeight;
      }

      fullText += pageText + '\n\n';
      totalTextLength += pageText.length;

      // Analyze X-gaps for diagnostics and adaptive threshold
      const avgXGap = xGaps.length > 0 ? xGaps.reduce((a, b) => a + b, 0) / xGaps.length : 0;
      const maxXGap = xGaps.length > 0 ? Math.max(...xGaps) : 0;

      // Sort gaps to find median (more robust than average)
      const sortedGaps = [...xGaps].sort((a, b) => a - b);
      const medianXGap = sortedGaps.length > 0 ? sortedGaps[Math.floor(sortedGaps.length / 2)] : 0;

      // Adaptive threshold: 3x the median gap (table columns are much wider than normal spacing)
      // But still use minimum of 40 to avoid false positives
      const adaptiveThreshold = Math.max(40, medianXGap * 3);
      const gapsOverAdaptive = xGaps.filter((g) => g > adaptiveThreshold).length;

      if (import.meta.env.DEV) {
        console.log(`[PDF Processing] Page ${pageNum}/${pdf.numPages}:`, {
          textLength: pageText.length,
          itemCount: textContent.items.length,
          extractionMethod,
          xGapStats: {
            avgGap: avgXGap.toFixed(1),
            medianGap: medianXGap.toFixed(1),
            maxGap: maxXGap.toFixed(1),
            totalGaps: xGaps.length,
            adaptiveThreshold: adaptiveThreshold.toFixed(1),
            gapsOverAdaptive,
          },
        });
      }

      // Render page to canvas to capture images and equations
      // Reduced scale from 2.0 to 1.2 to prevent 413 errors on multi-page documents
      // Lower scale still preserves equations and diagrams while significantly reducing payload
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        console.warn(`[PDF Processing] Canvas context not available for page ${pageNum}`);
        continue;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Convert canvas to JPEG (smaller file size than PNG, quality 0.7)
      // Quality 0.7 is sufficient for chemistry diagrams and equations while minimizing payload
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      const base64Data = imageData.split(',')[1];

      images.push({
        data: base64Data,
        mediaType: 'image/jpeg',
      });

      if (import.meta.env.DEV) {
        console.log(`[PDF Processing] Page ${pageNum} rendered:`, {
          canvasSize: `${canvas.width}x${canvas.height}`,
          imageSize: `${(base64Data.length / 1024).toFixed(2)} KB`,
        });
      }

      // Clean up canvas to free memory
      canvas.width = 0;
      canvas.height = 0;
    }

    const totalImageSize = images.reduce((sum, img) => sum + img.data.length, 0);
    const trimmedText = fullText.trim();
    const textLines = trimmedText.split('\n').length;

    // Analyze text structure for debugging
    const textStructure = analyzeTextStructure(trimmedText);

    if (import.meta.env.DEV) {
      console.log('[PDF Processing] Extraction complete:', {
        totalTextLength,
        textLines,
        numImages: images.length,
        totalImageSize: `${(totalImageSize / 1024).toFixed(2)} KB`,
        averageImageSize:
          images.length > 0 ? `${(totalImageSize / images.length / 1024).toFixed(2)} KB` : '0 KB',
        extractionMethod,
        textStructure,
      });
    }

    // Validate extraction results
    if (totalTextLength === 0 && images.length === 0) {
      console.error(
        '[PDF Processing] No content extracted from PDF - file may be empty or corrupted'
      );
      throw new Error('PDF skjalið virðist vera tómt eða skemmt');
    }

    if (totalTextLength === 0) {
      console.warn('[PDF Processing] No text extracted - PDF may be scanned/image-based');
    }

    // Build result with debug information
    const result: FileContent = {
      type: 'pdf',
      data: trimmedText,
      images: images,
      debug: {
        textLength: totalTextLength,
        textLines,
        imageCount: images.length,
        totalImageSize,
        averageImageSize: images.length > 0 ? Math.round(totalImageSize / images.length) : 0,
        extractionMethod,
        textSample: trimmedText.substring(0, 500),
        textStructure,
      },
    };

    // Log debug summary for easy comparison
    if (import.meta.env.DEV) {
      console.log('[PDF Processing] Debug Summary:', {
        method: result.debug?.extractionMethod,
        text: `${result.debug?.textLength} chars, ${result.debug?.textLines} lines`,
        images: `${result.debug?.imageCount} images, avg ${((result.debug?.averageImageSize ?? 0) / 1024).toFixed(0)} KB`,
        structure: `${result.debug?.textStructure?.paragraphCount} paragraphs, avg ${result.debug?.textStructure?.averageLineLength} chars/line`,
        sample: result.debug?.textSample?.substring(0, 100) + '...',
      });
    }

    return result;
  } catch (error) {
    console.error('[PDF Processing] Error during PDF extraction:', {
      fileName: file.name,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

/**
 * Process an image file
 */
const extractFromImage = async (file: File): Promise<FileContent> => {
  const base64 = await fileToBase64(file);
  return {
    type: 'image',
    data: base64,
    mediaType: file.type,
  };
};

/**
 * Validate PDF file before processing
 * Checks file size, structure, and basic integrity
 */
const validatePdf = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  if (import.meta.env.DEV) console.log('[PDF Validation] Starting validation for:', file.name);

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    console.error('[PDF Validation] File too large:', {
      size: file.size,
      maxSize,
      fileName: file.name,
    });
    return {
      valid: false,
      error: `PDF skjalið er of stórt (${(file.size / 1024 / 1024).toFixed(2)}MB). Hámark er 50MB`,
    };
  }

  // Check minimum file size (at least 1KB to be a valid PDF)
  if (file.size < 1024) {
    console.error('[PDF Validation] File too small:', {
      size: file.size,
      fileName: file.name,
    });
    return {
      valid: false,
      error: 'PDF skjalið er of lítið - það kann að vera skemmt',
    };
  }

  // Check PDF magic number (PDF files start with "%PDF-")
  try {
    const header = await file.slice(0, 5).text();
    if (!header.startsWith('%PDF-')) {
      console.error('[PDF Validation] Invalid PDF header:', {
        header,
        fileName: file.name,
      });
      return {
        valid: false,
        error: 'Skráin er ekki gilt PDF skjal',
      };
    }
    if (import.meta.env.DEV) console.log('[PDF Validation] Valid PDF header detected:', header);
  } catch (error) {
    console.error('[PDF Validation] Error reading file header:', error);
    return {
      valid: false,
      error: 'Gat ekki lesið PDF skrána',
    };
  }

  if (import.meta.env.DEV) console.log('[PDF Validation] Validation passed for:', file.name);
  return { valid: true };
};

/**
 * Main function to extract content from any supported file type
 * Supports: .docx, .pdf, and image files
 */
export const extractTextFromFile = async (file: File): Promise<FileContent | null> => {
  if (import.meta.env.DEV) {
    console.log('[File Processing] Starting extraction for:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      mimeType: file.type,
    });
  }

  try {
    const fileName = file.name.toLowerCase();

    // Word documents
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      if (import.meta.env.DEV) console.log('[File Processing] Processing as Word document');
      return await extractFromDocx(file);
    }

    // PDF files
    if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
      if (import.meta.env.DEV) console.log('[File Processing] Processing as PDF');

      // Validate PDF before processing
      const validation = await validatePdf(file);
      if (!validation.valid) {
        console.error('[File Processing] PDF validation failed:', validation.error);
        throw new Error(validation.error);
      }

      return await extractFromPdf(file);
    }

    // Image files
    if (file.type.startsWith('image/')) {
      if (import.meta.env.DEV) console.log('[File Processing] Processing as image');
      return await extractFromImage(file);
    }

    console.error('[File Processing] Unsupported file type:', {
      fileName: file.name,
      mimeType: file.type,
    });
    return null;
  } catch (error) {
    console.error('[File Processing] Error extracting text from file:', {
      fileName: file.name,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Re-throw the error to preserve the error message
    if (error instanceof Error) {
      throw error;
    }
    return null;
  }
};

/**
 * Validate file type
 */
export const isValidFileType = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.docx', '.pdf'];
  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ];

  return (
    validExtensions.some((ext) => fileName.endsWith(ext)) ||
    validMimeTypes.includes(file.type) ||
    file.type.startsWith('image/')
  );
};

/**
 * Get file type description for UI
 */
export const getFileTypeDescription = (file: File): string => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) return 'Word Document';
  if (fileName.endsWith('.pdf')) return 'PDF Document';
  if (file.type.startsWith('image/')) return 'Image';

  return 'Unknown';
};
