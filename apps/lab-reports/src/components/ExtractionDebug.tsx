import { FileContent } from '@/types';

interface ExtractionDebugProps {
  fileContent: FileContent;
  fileName: string;
}

/**
 * Debug component to display extraction metadata and compare DOCX vs PDF results
 * Enable by setting localStorage.setItem('debug-extraction', 'true')
 */
export const ExtractionDebug: React.FC<ExtractionDebugProps> = ({ fileContent, fileName }) => {
  if (!fileContent.debug) {
    return null;
  }

  const { debug } = fileContent;

  return (
    <div className="mt-4 p-4 bg-slate-100 border-2 border-slate-300 rounded-lg text-sm font-mono">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-700">🔍 Extraction Debug Info</h3>
        <span className="text-xs px-2 py-1 bg-slate-200 rounded">{fileName}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Extraction Method */}
        <div className="col-span-2 p-2 bg-white rounded">
          <div className="text-xs text-slate-500 mb-1">Extraction Method</div>
          <div className="font-semibold">
            {debug.extractionMethod === 'direct-pdf' ? (
              <span className="text-green-600">📄 Direct PDF</span>
            ) : (
              <span className="text-blue-600">📝 DOCX → PDF → Extraction</span>
            )}
          </div>
        </div>

        {/* Text Statistics */}
        <div className="p-2 bg-white rounded">
          <div className="text-xs text-slate-500 mb-1">Text Content</div>
          <div className="space-y-1">
            <div>
              <span className="text-slate-600">Length:</span>{' '}
              <span className="font-semibold">{debug.textLength.toLocaleString()} chars</span>
            </div>
            <div>
              <span className="text-slate-600">Lines:</span>{' '}
              <span className="font-semibold">{debug.textLines}</span>
            </div>
            <div>
              <span className="text-slate-600">Whitespace:</span>{' '}
              <span className="font-semibold">{(debug.textStructure?.whitespaceDensity ?? 0) * 100}%</span>
            </div>
          </div>
        </div>

        {/* Image Statistics */}
        <div className="p-2 bg-white rounded">
          <div className="text-xs text-slate-500 mb-1">Images</div>
          <div className="space-y-1">
            <div>
              <span className="text-slate-600">Count:</span>{' '}
              <span className="font-semibold">{debug.imageCount}</span>
            </div>
            <div>
              <span className="text-slate-600">Total size:</span>{' '}
              <span className="font-semibold">{(debug.totalImageSize / 1024).toFixed(0)} KB</span>
            </div>
            <div>
              <span className="text-slate-600">Avg size:</span>{' '}
              <span className="font-semibold">{(debug.averageImageSize / 1024).toFixed(0)} KB</span>
            </div>
          </div>
        </div>

        {/* Text Structure */}
        <div className="col-span-2 p-2 bg-white rounded">
          <div className="text-xs text-slate-500 mb-1">Text Structure</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-600">Paragraphs:</span>{' '}
              <span className="font-semibold">{debug.textStructure?.paragraphCount ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-600">Avg line length:</span>{' '}
              <span className="font-semibold">{debug.textStructure?.averageLineLength ?? 0} chars</span>
            </div>
          </div>
        </div>

        {/* Table Detection */}
        <div className="col-span-2 p-2 bg-white rounded">
          <div className="text-xs text-slate-500 mb-1">Table Detection</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-600">Column separators:</span>{' '}
              <span className="font-semibold">{debug.tableDetection?.columnSeparatorsDetected ?? 0}</span>
            </div>
            <div>
              <span className="text-slate-600">Has tables:</span>{' '}
              {debug.tableDetection?.hasTableStructure ? (
                <span className="font-semibold text-green-600">✓ Yes</span>
              ) : (
                <span className="font-semibold text-slate-400">✗ No</span>
              )}
            </div>
          </div>
          {debug.tableDetection?.hasTableStructure && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              📊 Table structure detected. Look for " | " separators in text sample below.
            </div>
          )}
        </div>

        {/* Text Sample */}
        <div className="col-span-2 p-2 bg-white rounded">
          <div className="text-xs text-slate-500 mb-1">Text Sample (first 500 chars)</div>
          <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200 max-h-32 overflow-y-auto whitespace-pre-wrap break-words">
            {debug.textSample || '(no text)'}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 italic">
        💡 Tip: Compare this debug info when uploading the same document as .docx vs .pdf to identify differences.
      </div>
    </div>
  );
};
