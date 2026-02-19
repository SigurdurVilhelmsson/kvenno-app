import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Home } from 'lucide-react';
import {
  AnalysisResult,
  ProcessingStatus,
  Toast as ToastType,
  GradingSession,
} from '@/types';
import { experimentConfigs, getExperiments } from '@/config/experiments';
import { extractTextFromFile } from '@/utils/fileProcessing';
import { processFile } from '@/utils/api';
import {
  loadSavedSessions,
  saveSession,
  loadSession as loadStoredSession,
  deleteSession as deleteStoredSession,
  generateSessionId,
} from '@/utils/storage';
import { exportResultsToCSV } from '@/utils/export';
import { Toast } from '@/components/Toast';
import { SaveDialog, ConfirmDialog } from '@/components/Modal';
import { FileUpload } from '@/components/FileUpload';
import { TeacherResults } from '@/components/TeacherResults';
import { SessionHistory } from '@/components/SessionHistory';

type View = 'grader' | 'history';

export function TeacherPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('grader');

  // Experiment selection
  const [selectedExperiment, setSelectedExperiment] = useState('jafnvaegi');
  const currentExperiment = experimentConfigs[selectedExperiment];

  // File handling
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    current: 0,
    total: 0,
    currentFile: '',
  });

  // Results
  const [results, setResults] = useState<AnalysisResult[]>([]);

  // Session management
  const [savedSessions, setSavedSessions] = useState<GradingSession[]>([]);
  const [currentSessionName, setCurrentSessionName] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // UI state
  const [toast, setToast] = useState<ToastType>({ show: false, message: '', type: 'success' });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDialogName, setSaveDialogName] = useState('');
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const experiments = getExperiments();
  const sections = currentExperiment.sections;

  // Load saved sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const sessions = await loadSavedSessions();
    // Filter to show only teacher mode sessions
    setSavedSessions(sessions.filter((s) => s.mode === 'teacher'));
  };

  const showToast = (message: string, type: ToastType['type'] = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setResults([]);
    setIsSaved(false);
  };

  const processReports = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setProcessingStatus({ current: 0, total: files.length, currentFile: '' });
    const newResults: AnalysisResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setProcessingStatus({
        current: i + 1,
        total: files.length,
        currentFile: file.name,
      });

      try {
        const content = await extractTextFromFile(file);
        if (!content) {
          newResults.push({
            filename: file.name,
            error: 'Gat ekki lesið skrá',
          } as AnalysisResult);
          continue;
        }

        const result = await processFile(file, content, currentExperiment, 'teacher');
        newResults.push(result as AnalysisResult);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        newResults.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Villa við vinnslu',
        } as AnalysisResult);
      }
    }

    setResults(newResults);
    setProcessing(false);
    setIsSaved(false);
    setProcessingStatus({ current: 0, total: 0, currentFile: '' });
  };

  const handleSaveSession = async () => {
    if (results.length === 0) {
      showToast('Engar niðurstöður til að vista', 'error');
      return;
    }

    if (!currentSessionName) {
      setSaveDialogName(`Greining ${new Date().toLocaleDateString('is-IS')}`);
      setShowSaveDialog(true);
      return;
    }

    await performSave(currentSessionName);
  };

  const performSave = async (name: string) => {
    try {
      const sessionId = currentSessionId || generateSessionId();
      const session: GradingSession = {
        id: sessionId,
        name: name,
        experiment: selectedExperiment,
        timestamp: new Date().toISOString(),
        results: results,
        fileCount: results.length,
        mode: 'teacher',
      };

      await saveSession(session);
      setCurrentSessionName(name);
      setCurrentSessionId(sessionId);
      setIsSaved(true);
      await loadSessions();
      showToast('✓ Greining vistuð!', 'success');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving session:', error);
      showToast('Villa við að vista', 'error');
    }
  };

  const startNewAnalysis = () => {
    if (results.length > 0 && !isSaved) {
      setShowConfirmNew(true);
    } else {
      clearAnalysis();
    }
  };

  const clearAnalysis = () => {
    setFiles([]);
    setResults([]);
    setCurrentSessionName('');
    setCurrentSessionId('');
    setIsSaved(false);
    setProcessingStatus({ current: 0, total: 0, currentFile: '' });
    setShowConfirmNew(false);
  };

  const handleLoadSession = async (sessionId: string) => {
    const session = await loadStoredSession(sessionId);
    if (session && session.mode === 'teacher') {
      setResults(session.results);
      setSelectedExperiment(session.experiment);
      setCurrentSessionName(session.name);
      setCurrentSessionId(session.id);
      setIsSaved(true);
      setView('grader');
      showToast('Greining hlaðin', 'success');
    } else {
      showToast('Villa við að hlaða greiningu', 'error');
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      await deleteStoredSession(sessionToDelete);
      await loadSessions();
      setShowDeleteDialog(false);
      setSessionToDelete(null);
      showToast('Greiningu eytt', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast('Villa við að eyða', 'error');
    }
  };

  const handleExport = () => {
    try {
      exportResultsToCSV(results, sections);
      showToast('CSV skrá niðurhalað', 'success');
    } catch (error) {
      showToast('Villa við að búa til CSV skrá', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Kennslutól - Kennaraviðmót
              </h1>
              <p className="text-slate-600">Hraðmat á skýrslum nemenda</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg transition bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center gap-2"
              >
                <Home size={18} />
                Heim
              </button>
              <button
                onClick={() => {
                  startNewAnalysis();
                  setView('grader');
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  view === 'grader'
                    ? 'bg-kvenno-orange text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Ný greining
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  view === 'history'
                    ? 'bg-kvenno-orange text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <History size={18} />
                Saga ({savedSessions.length})
              </button>
            </div>
          </div>

          {view === 'history' ? (
            <SessionHistory
              sessions={savedSessions}
              onLoadSession={handleLoadSession}
              onDeleteSession={handleDeleteSession}
            />
          ) : (
            <>
              {/* Experiment selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Veldu tilraun:
                </label>
                <select
                  value={selectedExperiment}
                  onChange={(e) => setSelectedExperiment(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-kvenno-orange"
                >
                  {experiments.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} ({exp.year}. ár)
                    </option>
                  ))}
                </select>
              </div>

              {/* File upload */}
              <FileUpload
                files={files}
                onFilesSelected={handleFilesSelected}
                onProcess={processReports}
                processing={processing}
                processingStatus={processingStatus}
              />
            </>
          )}
        </div>

        {/* Results display */}
        {view === 'grader' && (
          <TeacherResults
            results={results}
            sections={sections}
            sessionName={currentSessionName}
            onSave={handleSaveSession}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Modals and Toast */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={performSave}
        defaultName={saveDialogName}
      />

      <ConfirmDialog
        isOpen={showConfirmNew}
        onClose={() => setShowConfirmNew(false)}
        onConfirm={clearAnalysis}
        title="Byrja nýja greiningu?"
        message="Þú ert með óvistaðar niðurstöður. Viltu vista áður en þú byrjar nýja greiningu?"
        confirmText="Eyða án þess að vista"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSessionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eyða greiningu?"
        message="Ertu viss um að þú viljir eyða þessari greiningu? Þetta er ekki hægt að afturkalla."
        confirmText="Eyða"
        confirmVariant="danger"
      />

      <Toast toast={toast} />
    </div>
  );
}
