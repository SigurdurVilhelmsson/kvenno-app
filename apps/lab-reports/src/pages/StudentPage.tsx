import { useState, useEffect } from 'react';

import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Breadcrumbs, Header, Container } from '@kvenno/shared/components';

import { AuthButton } from '@/components/AuthButton';
import { FileUpload } from '@/components/FileUpload';
import { StudentFeedback as StudentFeedbackComponent } from '@/components/StudentFeedback';
import { StudentHome } from '@/components/StudentHome';
import { Toast } from '@/components/Toast';
import { WorksheetView } from '@/components/WorksheetView';
import { experimentConfigs, getExperiments } from '@/config/experiments';
import { StudentFeedback, ProcessingStatus, Toast as ToastType, GradingSession } from '@/types';
import { processFile } from '@/utils/api';
import { extractTextFromFile } from '@/utils/fileProcessing';
import { loadSavedSessions, saveSession, generateSessionId } from '@/utils/storage';

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

  const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
  const yearMatch = basePath.match(/\/(\d)-ar\//);
  const year = yearMatch ? yearMatch[1] : '3';

  const breadcrumbItems = [
    { label: 'Heim', href: '/' },
    { label: 'Efnafræði', href: '/efnafraedi/' },
    { label: `${year}. ár`, href: `/efnafraedi/${year}-ar/` },
    { label: 'Tilraunaskýrslur' },
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-orange-50">
        <Header activeTrack="efnafraedi" authSlot={<AuthButton />} />
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg transition bg-warm-200 text-warm-700 hover:bg-warm-300 flex items-center gap-2"
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
        </Container>
        <Toast toast={toast} />
      </div>
    );
  }

  if (view === 'experiments') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-orange-50">
        <Header activeTrack="efnafraedi" authSlot={<AuthButton />} />
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbItems} />
          <button
            onClick={() => setView('home')}
            className="mb-4 text-kvenno-orange hover:text-warm-800 flex items-center gap-2"
          >
            ← Til baka
          </button>

          <div className="bg-surface-raised rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-heading font-bold text-warm-900 mb-6">Veldu tilraun</h2>

            <div className="space-y-4">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="border rounded-lg p-4 hover:border-kvenno-orange transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-warm-800">{exp.title}</h3>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {exp.year}. ár
                    </span>
                  </div>
                  {exp.worksheet && (
                    <p className="text-sm text-warm-600 mb-3">
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
        </Container>
        <Toast toast={toast} />
      </div>
    );
  }

  if (view === 'worksheet' && currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-orange-50">
        <Header activeTrack="efnafraedi" authSlot={<AuthButton />} />
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbItems} />
          <WorksheetView
            experiment={currentExperiment}
            onContinue={() => setView('upload')}
            onBack={() => setView('home')}
          />
        </Container>
        <Toast toast={toast} />
      </div>
    );
  }

  if (view === 'upload' && currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-orange-50">
        <Header activeTrack="efnafraedi" authSlot={<AuthButton />} />
        <Container className="py-6">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setView('worksheet')}
              className="text-kvenno-orange hover:text-warm-800 flex items-center gap-2"
            >
              ← Skoða vinnuseðil
            </button>
            <button onClick={handleClose} className="text-warm-600 hover:text-warm-800">
              Hætta við
            </button>
          </div>

          <div className="bg-surface-raised rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-heading font-bold text-warm-900 mb-2">
              {currentExperiment.title}
            </h2>
            <p className="text-warm-600 mb-6">Hladdu upp drögunum þínum</p>

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
        </Container>
        <Toast toast={toast} />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-orange-50">
      <Header activeTrack="efnafraedi" authSlot={<AuthButton />} />
      <Container className="py-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="bg-surface-raised rounded-lg shadow-lg p-8">
          <p className="text-warm-600">Hleður...</p>
        </div>
      </Container>
      <Toast toast={toast} />
    </div>
  );
}
