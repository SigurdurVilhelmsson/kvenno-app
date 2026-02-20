import { useState, useEffect } from 'react';

import { Home, Upload, CheckCircle, RotateCcw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ChecklistResults } from '@/components/ChecklistResults';
import { Toast } from '@/components/Toast';
import { experimentConfigs2, getExperiments2 } from '@/config/experiments';
import {
  Analysis2Result,
  Toast as ToastType,
  ExperimentConfig2,
} from '@/types';
import { processFile2ar } from '@/utils/api';
import { exportChecklist2ToCSV } from '@/utils/export';
import { extractTextFromFile } from '@/utils/fileProcessing';

interface FileWithResult {
  file: File;
  draftFile?: File;
  result?: Analysis2Result;
  processing: boolean;
  error?: string;
}

export function Teacher2Page() {
  const navigate = useNavigate();

  // Experiment selection
  const experiments2 = getExperiments2();
  const [selectedExperiment, setSelectedExperiment] = useState<string>(experiments2[0]?.id || 'orka-2ar');
  const currentExperiment: ExperimentConfig2 = experimentConfigs2[selectedExperiment];

  // Files and results
  const [finalFiles, setFinalFiles] = useState<File[]>([]);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [fileResults, setFileResults] = useState<FileWithResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(0);

  // Completed results for export
  const [completedResults, setCompletedResults] = useState<Analysis2Result[]>([]);

  // UI state
  const [toast, setToast] = useState<ToastType>({ show: false, message: '', type: 'success' });
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string, type: ToastType['type'] = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleFinalFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFinalFiles(selected);
    setFileResults([]);
    setCompletedResults([]);
    setExpandedResult(null);
  };

  const handleDraftFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setDraftFile(selected);
  };

  const processReports = async () => {
    if (finalFiles.length === 0) return;

    setProcessing(true);
    setFileResults([]);
    setCompletedResults([]);

    // Extract draft content once (shared across all final reports)
    let draftContent: string | null = null;
    if (draftFile) {
      try {
        const draftExtracted = await extractTextFromFile(draftFile);
        draftContent = draftExtracted?.data || null;
      } catch (err) {
        console.error('Error extracting draft:', err);
        showToast('Villa við að lesa drög - halda áfram án þeirra', 'error');
      }
    }

    const allResults: FileWithResult[] = [];
    const completed: Analysis2Result[] = [];

    for (let i = 0; i < finalFiles.length; i++) {
      const file = finalFiles[i];
      setProcessingIndex(i);

      const entry: FileWithResult = { file, processing: true };
      allResults.push(entry);
      setFileResults([...allResults]);

      try {
        const content = await extractTextFromFile(file);
        if (!content) {
          entry.error = 'Gat ekki lesið skrá';
          entry.processing = false;
          setFileResults([...allResults]);
          continue;
        }

        const result = await processFile2ar(
          content,
          draftContent,
          currentExperiment
        );

        entry.result = result;
        entry.processing = false;
        completed.push(result);
        setFileResults([...allResults]);
        setCompletedResults([...completed]);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        entry.error = error instanceof Error ? error.message : 'Villa við vinnslu';
        entry.processing = false;
        setFileResults([...allResults]);
      }
    }

    setProcessing(false);
    if (completed.length > 0) {
      setExpandedResult(0);
    }
  };

  const clearAll = () => {
    setFinalFiles([]);
    setDraftFile(null);
    setFileResults([]);
    setCompletedResults([]);
    setExpandedResult(null);
    setProcessingIndex(0);
  };

  const handleExport = () => {
    if (completedResults.length === 0) {
      showToast('Engar niðurstöður til að flytja út', 'error');
      return;
    }
    try {
      const filenames = fileResults
        .filter(fr => fr.result)
        .map(fr => fr.file.name);
      exportChecklist2ToCSV(completedResults, filenames, currentExperiment);
      showToast('CSV skrá niðurhalað', 'success');
    } catch {
      showToast('Villa við að búa til CSV skrá', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-raised rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-warm-900 mb-2">
                2. ár - Gátlistamat
              </h1>
              <p className="text-warm-600">Einfaldað mat á skýrslum nemenda (til staðar / vantar)</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg transition bg-warm-200 text-warm-700 hover:bg-warm-300 flex items-center gap-2"
              >
                <Home size={18} />
                Heim
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-lg transition bg-kvenno-orange text-white hover:bg-orange-600"
              >
                Ný greining
              </button>
            </div>
          </div>

          {/* Experiment selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-warm-700 mb-2">
              Veldu tilraun:
            </label>
            <select
              value={selectedExperiment}
              onChange={(e) => setSelectedExperiment(e.target.value)}
              className="w-full p-3 border border-warm-300 rounded-lg focus:ring-2 focus:ring-kvenno-orange"
            >
              {experiments2.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.title} ({exp.year}. ár)
                </option>
              ))}
            </select>
          </div>

          {/* Draft upload (optional) */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-warm-800 mb-2">
              Drög - Fræðikafli (valfrjálst)
            </h3>
            <p className="text-sm text-warm-600 mb-3">
              Ef nemandi skilaði drögum á Inna, hladdu þeim upp hér til samanburðar.
              Þetta hjálpar til við að greina hvort lokaskýrslan sé byggð á drögunum.
            </p>
            <input
              type="file"
              accept=".docx,.pdf,image/*"
              onChange={handleDraftFileSelected}
              className="hidden"
              id="draft-upload"
            />
            <label
              htmlFor="draft-upload"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              <Upload size={16} />
              {draftFile ? draftFile.name : 'Velja drög'}
            </label>
            {draftFile && (
              <button
                onClick={() => setDraftFile(null)}
                className="ml-3 text-sm text-red-600 hover:text-red-800"
              >
                Fjarlægja
              </button>
            )}
          </div>

          {/* Final report upload */}
          <div className="mb-6">
            <h3 className="font-semibold text-warm-800 mb-2">
              Lokaskýrslur nemenda
            </h3>
            <div className="border-2 border-dashed border-warm-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-4 text-warm-600" size={48} />
              <p className="text-sm text-warm-600 mb-4">
                Word skjöl (.docx), PDF skrár (.pdf) eða myndir - margar í einu
              </p>
              <input
                type="file"
                accept=".docx,.pdf,image/*"
                multiple
                onChange={handleFinalFilesSelected}
                className="hidden"
                id="final-upload"
              />
              <label
                htmlFor="final-upload"
                className="bg-kvenno-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition cursor-pointer inline-block"
              >
                Velja skýrslur
              </label>
            </div>
          </div>

          {/* Selected files list */}
          {finalFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-warm-800 mb-3">
                {finalFiles.length} skýrsl{finalFiles.length !== 1 ? 'ur' : 'a'} valin{finalFiles.length !== 1 ? 'ar' : ''}
              </h3>
              <div className="space-y-2 mb-4">
                {finalFiles.map((file, i) => (
                  <div key={i} className="bg-warm-50 p-3 rounded flex items-center gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    <span className="text-sm text-warm-700 truncate">{file.name}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={processReports}
                disabled={processing}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition disabled:bg-warm-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
              >
                {processing ? (
                  <>
                    <RotateCcw className="animate-spin" size={24} />
                    <span>
                      Vinn úr skýrslum... ({processingIndex + 1}/{finalFiles.length})
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={24} />
                    Greina skýrslur
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {fileResults.length > 0 && (
          <div className="bg-surface-raised rounded-lg shadow-lg p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-warm-900">Niðurstöður</h2>
              {completedResults.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-kvenno-orange text-white rounded-lg hover:bg-orange-600 transition"
                >
                  <Download size={18} />
                  Flytja út CSV
                </button>
              )}
            </div>

            <div className="space-y-4">
              {fileResults.map((fr, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <button
                    className={`w-full text-left p-4 flex items-center justify-between transition ${
                      fr.error ? 'bg-red-50' : fr.processing ? 'bg-warm-50' : 'bg-green-50 hover:bg-green-100'
                    }`}
                    onClick={() => setExpandedResult(expandedResult === i ? null : i)}
                    disabled={fr.processing || !!fr.error}
                  >
                    <div className="flex items-center gap-3">
                      {fr.processing && <RotateCcw className="animate-spin text-warm-500" size={18} />}
                      {fr.error && <span className="text-red-600 font-bold">!</span>}
                      {fr.result && <CheckCircle className="text-green-600" size={18} />}
                      <span className="font-medium text-warm-800">{fr.file.name}</span>
                    </div>
                    {fr.result && (
                      <span className="text-sm text-warm-500">
                        {expandedResult === i ? 'Fela' : 'Sýna'}
                      </span>
                    )}
                  </button>

                  {fr.error && (
                    <div className="p-4 bg-red-50 border-t border-red-200">
                      <p className="text-red-700 text-sm">{fr.error}</p>
                    </div>
                  )}

                  {fr.result && expandedResult === i && (
                    <div className="p-4 border-t">
                      <ChecklistResults result={fr.result} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
