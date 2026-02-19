import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  StudentFeedback,
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
  generateSessionId,
} from '@/utils/storage';
import { Toast } from '@/components/Toast';
import { FileUpload } from '@/components/FileUpload';
import { StudentFeedback as StudentFeedbackComponent } from '@/components/StudentFeedback';
import { StudentHome } from '@/components/StudentHome';
import { WorksheetView } from '@/components/WorksheetView';

type View = 'home' | 'experiments' | 'worksheet' | 'upload' | 'history';

export function StudentPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('home');

  // Experiment selection
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const currentExperiment = selectedExperiment ? experimentConfigs[selectedExperiment] : null;

  // File handling
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    current: 0,
    total: 0,
    currentFile: '',
  });

  // Feedback
  const [feedback, setFeedback] = useState<StudentFeedback[]>([]);

  // Session management
  const [savedSessions, setSavedSessions] = useState<GradingSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // UI state
  const [toast, setToast] = useState<ToastType>({ show: false, message: '', type: 'success' });

  const experiments = getExperiments();

  // Load saved sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const sessions = await loadSavedSessions();
    // Filter to show only student mode sessions
    setSavedSessions(sessions.filter((s) => s.mode === 'student'));
  };

  const showToast = (message: string, type: ToastType['type'] = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const startNewReport = () => {
    setView('experiments');
  };

  const selectExperiment = (experimentId: string) => {
    setSelectedExperiment(experimentId);
    setCurrentSessionId(null);
    setFiles([]);
    setFeedback([]);
    setView('worksheet');
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setFeedback([]);
  };

  const processReports = async () => {
    if (files.length === 0 || !currentExperiment) return;

    setProcessing(true);
    setProcessingStatus({ current: 0, total: files.length, currentFile: '' });
    const newFeedback: StudentFeedback[] = [];

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
          showToast('Gat ekki lesið skrá', 'error');
          continue;
        }

        const result = await processFile(file, content, currentExperiment, 'student');
        newFeedback.push(result as StudentFeedback);

        // Save session automatically
        const sessionId = currentSessionId || generateSessionId();
        if (!currentSessionId) setCurrentSessionId(sessionId);

        const session: GradingSession = {
          id: sessionId,
          name: `${currentExperiment.title} - ${new Date().toLocaleDateString('is-IS')}`,
          experiment: currentExperiment.id,
          timestamp: new Date().toISOString(),
          results: [result] as StudentFeedback[],
          fileCount: 1,
          mode: 'student',
        };

        await saveSession(session);
        await loadSessions();
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        showToast('Villa við vinnslu', 'error');
      }
    }

    setFeedback(newFeedback);
    setProcessing(false);
    setProcessingStatus({ current: 0, total: 0, currentFile: '' });
  };

  const handleRetry = () => {
    setFiles([]);
    setFeedback([]);
  };

  const handleClose = () => {
    setView('home');
    setSelectedExperiment(null);
    setFiles([]);
    setFeedback([]);
    setCurrentSessionId(null);
  };

  // Render different views
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg transition bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center gap-2"
            >
              <Home size={18} />
              Til baka
            </button>
          </div>
          <StudentHome
            sessions={savedSessions}
            onStartNew={startNewReport}
            onViewHistory={() => setView('history')}
          />
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  if (view === 'experiments') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setView('home')}
            className="mb-4 text-kvenno-orange hover:text-slate-800 flex items-center gap-2"
          >
            ← Til baka
          </button>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Veldu tilraun</h2>

            <div className="space-y-4">
              {experiments.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-4 hover:border-kvenno-orange transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{exp.title}</h3>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {exp.year}. ár
                    </span>
                  </div>
                  {exp.worksheet && (
                    <p className="text-sm text-slate-600 mb-3">
                      Efnahvarf: {exp.worksheet.reaction}
                    </p>
                  )}
                  <button
                    onClick={() => selectExperiment(exp.id)}
                    className="bg-kvenno-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                  >
                    Velja þessa tilraun
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  if (view === 'worksheet' && currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <WorksheetView
            experiment={currentExperiment}
            onContinue={() => setView('upload')}
            onBack={() => setView('home')}
          />
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  if (view === 'upload' && currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setView('worksheet')}
              className="text-kvenno-orange hover:text-slate-800 flex items-center gap-2"
            >
              ← Skoða vinnuseðil
            </button>
            <button onClick={handleClose} className="text-slate-600 hover:text-slate-800">
              Hætta við
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentExperiment.title}</h2>
            <p className="text-slate-600 mb-6">Hladdu upp drögunum þínum</p>

            <FileUpload
              files={files}
              onFilesSelected={handleFilesSelected}
              onProcess={processReports}
              processing={processing}
              processingStatus={processingStatus}
              acceptedFileTypes=".docx,.pdf,image/*"
              mode="student"
            />
          </div>

          {feedback.length > 0 && (
            <StudentFeedbackComponent
              feedback={feedback}
              sections={currentExperiment.sections}
              onRetry={handleRetry}
              onClose={handleClose}
            />
          )}
        </div>
        <Toast toast={toast} />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-slate-600">Hleður...</p>
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
