import React, { Suspense, useEffect } from 'react';

import { History, GraduationCap, BookOpen, ArrowLeft } from 'lucide-react';

import { Breadcrumbs } from '@kvenno/shared/components/Breadcrumbs';
import { Header } from '@kvenno/shared/components/Header';

import { AuthButton } from './components/AuthButton';
import { FileUpload } from './components/FileUpload';
import { SaveDialog, ConfirmDialog } from './components/Modal';
import { Toast } from './components/Toast';
import { experimentConfigs, getExperiments } from './config/experiments';
import { useAppReducer } from './hooks/useAppReducer';
import { AnalysisResult, StudentFeedback, GradingSession } from './types';
import { processFile } from './utils/api';
import { getBreadcrumbsForPath } from './utils/breadcrumbs';
import { exportResultsToCSV } from './utils/export';
// eslint-disable-next-line import/order
import { extractTextFromFile } from './utils/fileProcessing';

const SessionHistory = React.lazy(() =>
  import('./components/SessionHistory').then((m) => ({ default: m.SessionHistory }))
);
const StudentFeedbackComponent = React.lazy(() =>
  import('./components/StudentFeedback').then((m) => ({ default: m.StudentFeedback }))
);
const TeacherResults = React.lazy(() =>
  import('./components/TeacherResults').then((m) => ({ default: m.TeacherResults }))
);
import {
  loadSavedSessions,
  saveSession,
  loadSession as loadStoredSession,
  deleteSession as deleteStoredSession,
  generateSessionId,
} from './utils/storage';

function App() {
  const { state, dispatch, showToast } = useAppReducer();

  const appModeConfig = import.meta.env.VITE_APP_MODE || 'dual';
  const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
  const yearMatch = basePath.match(/\/(\d)-ar\//);
  const backPath = yearMatch ? `/${yearMatch[1]}-ar/` : '/';
  const breadcrumbs = getBreadcrumbsForPath(basePath);

  const currentExperiment = experimentConfigs[state.selectedExperiment];
  const experiments = getExperiments();
  const sections = currentExperiment.sections;

  // Load saved sessions on mount
  useEffect(() => {
    loadSavedSessions().then((sessions) => {
      dispatch({ type: 'SET_SAVED_SESSIONS', sessions });
    });
  }, [dispatch]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (state.ui.toast.show) {
      const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.ui.toast.show, dispatch]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    dispatch({ type: 'SET_FILES', files: selectedFiles });
  };

  const processReports = async () => {
    if (state.files.list.length === 0) return;

    dispatch({ type: 'START_PROCESSING', total: state.files.list.length });
    const newResults: (AnalysisResult | StudentFeedback)[] = [];

    for (let i = 0; i < state.files.list.length; i++) {
      const file = state.files.list[i];
      dispatch({ type: 'UPDATE_PROCESSING_STATUS', current: i + 1, currentFile: file.name });

      try {
        const content = await extractTextFromFile(file);
        if (!content) {
          newResults.push({ filename: file.name, error: 'Gat ekki lesið skrá' } as AnalysisResult);
          continue;
        }
        const result = await processFile(file, content, currentExperiment, state.mode);
        newResults.push(result);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        newResults.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Villa við vinnslu',
        } as AnalysisResult);
      }
    }

    if (state.mode === 'teacher') {
      dispatch({ type: 'FINISH_PROCESSING', results: newResults as AnalysisResult[], mode: 'teacher' });
    } else {
      dispatch({ type: 'FINISH_PROCESSING', results: newResults as StudentFeedback[], mode: 'student' });
    }
  };

  const handleSaveSession = async () => {
    const resultsToSave = state.mode === 'teacher' ? state.results.analyses : state.results.studentFeedback;
    if (resultsToSave.length === 0) {
      showToast('Engar niðurstöður til að vista', 'error');
      return;
    }

    if (!state.session.currentName) {
      dispatch({
        type: 'SHOW_SAVE_DIALOG',
        defaultName: `Greining ${new Date().toLocaleDateString('is-IS')}`,
      });
      return;
    }

    await performSave(state.session.currentName);
  };

  const performSave = async (name: string) => {
    try {
      const sessionId = state.session.currentId || generateSessionId();
      const session: GradingSession = {
        id: sessionId,
        name,
        experiment: state.selectedExperiment,
        timestamp: new Date().toISOString(),
        results: state.mode === 'teacher' ? state.results.analyses : state.results.studentFeedback,
        fileCount: state.mode === 'teacher' ? state.results.analyses.length : state.results.studentFeedback.length,
        mode: state.mode,
      };

      await saveSession(session);
      dispatch({ type: 'SESSION_SAVED', name, id: sessionId });
      const sessions = await loadSavedSessions();
      dispatch({ type: 'SET_SAVED_SESSIONS', sessions });
      showToast('✓ Greining vistuð!', 'success');
    } catch (error) {
      console.error('Error saving session:', error);
      showToast('Villa við að vista', 'error');
    }
  };

  const startNewAnalysis = () => {
    const hasResults = state.mode === 'teacher'
      ? state.results.analyses.length > 0
      : state.results.studentFeedback.length > 0;
    if (hasResults && !state.session.isSaved) {
      dispatch({ type: 'SHOW_CONFIRM_NEW' });
    } else {
      dispatch({ type: 'CLEAR_ANALYSIS' });
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    const session = await loadStoredSession(sessionId);
    if (session) {
      dispatch({ type: 'SESSION_LOADED', session });
      showToast('Greining hlaðin', 'success');
    } else {
      showToast('Villa við að hlaða greiningu', 'error');
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    dispatch({ type: 'SHOW_DELETE_DIALOG', sessionId });
  };

  const confirmDelete = async () => {
    if (!state.session.toDelete) return;

    try {
      await deleteStoredSession(state.session.toDelete);
      dispatch({ type: 'SESSION_DELETED' });
      const sessions = await loadSavedSessions();
      dispatch({ type: 'SET_SAVED_SESSIONS', sessions });
      showToast('Greiningu eytt', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast('Villa við að eyða', 'error');
    }
  };

  const handleExport = () => {
    try {
      exportResultsToCSV(state.results.analyses, sections);
      showToast('CSV skrá niðurhalað', 'success');
    } catch {
      showToast('Villa við að búa til CSV skrá', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header
        authSlot={<AuthButton />}
        onInfoClick={() => dispatch({ type: 'TOGGLE_INFO' })}
      />

      <div className="max-w-7xl mx-auto p-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Back button */}
        <a
          href={backPath}
          className="inline-flex items-center gap-2 mb-6 text-slate-700 hover:text-kvenno-orange transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Til baka</span>
        </a>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {/* Info panel */}
          {state.ui.showInfo && (
            <div className="mb-6 p-4 bg-orange-50 border border-kvenno-orange rounded-lg">
              <h3 className="font-bold text-slate-900 mb-2">Um verkfærið</h3>
              <p className="text-sm text-slate-700 mb-2">
                Þetta verkfæri notar gervigreind (Claude AI) til að meta tilraunarskýrslur í efnafræði og veita ítarlega endurgjöf.
              </p>
              <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                <li><strong>Kennarar:</strong> Geta metið margar skýrslur í einu og flutt út niðurstöður</li>
                <li><strong>Nemendur:</strong> Fá ítarlega endurgjöf með tillögum til úrbóta</li>
                <li>Styður Word (.docx), PDF og myndir</li>
                <li>Öll gögn eru vistuð í vafranum þínum</li>
              </ul>
            </div>
          )}

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Tilraunarskýrslur
                <span className="text-sm text-kvenno-orange ml-3 font-normal">(v3.0.0)</span>
              </h1>
              <p className="text-slate-600">
                {state.mode === 'teacher'
                  ? 'Hraðmat á skýrslum nemenda'
                  : 'Hjálp við að skrifa rannsóknaskýrslur'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  startNewAnalysis();
                  dispatch({ type: 'SET_VIEW', view: 'grader' });
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  state.view === 'grader'
                    ? 'bg-kvenno-orange text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Ný greining
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'history' })}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  state.view === 'history'
                    ? 'bg-kvenno-orange text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <History size={18} />
                Saga ({state.session.saved.length})
              </button>
            </div>
          </div>

          {/* Mode selector (if dual mode enabled) */}
          {appModeConfig === 'dual' && state.view === 'grader' && (
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => dispatch({ type: 'SET_MODE', mode: 'teacher' })}
                className={`flex-1 px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                  state.mode === 'teacher'
                    ? 'bg-kvenno-orange text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <GraduationCap size={20} />
                <span className="font-semibold">Kennari</span>
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_MODE', mode: 'student' })}
                className={`flex-1 px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                  state.mode === 'student'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BookOpen size={20} />
                <span className="font-semibold">Nemandi</span>
              </button>
            </div>
          )}

          {state.view === 'history' ? (
            <Suspense fallback={<div className="text-center py-8 text-slate-500">Hleð...</div>}>
              <SessionHistory
                sessions={state.session.saved}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
              />
            </Suspense>
          ) : (
            <>
              {/* Experiment selector */}
              <div className="mb-6">
                <label htmlFor="experiment-select" className="block text-sm font-medium text-slate-700 mb-2">
                  Veldu tilraun:
                </label>
                <select
                  id="experiment-select"
                  value={state.selectedExperiment}
                  onChange={(e) => dispatch({ type: 'SET_EXPERIMENT', experiment: e.target.value })}
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
                files={state.files.list}
                onFilesSelected={handleFilesSelected}
                onProcess={processReports}
                processing={state.files.processing}
                processingStatus={state.files.status}
              />
            </>
          )}
        </div>

        {/* Results display */}
        {state.view === 'grader' && state.mode === 'teacher' && (
          <Suspense fallback={<div className="text-center py-8 text-slate-500">Hleð...</div>}>
            <TeacherResults
              results={state.results.analyses}
              sections={sections}
              sessionName={state.session.currentName}
              onSave={handleSaveSession}
              onExport={handleExport}
            />
          </Suspense>
        )}

        {state.view === 'grader' && state.mode === 'student' && (
          <Suspense fallback={<div className="text-center py-8 text-slate-500">Hleð...</div>}>
            <StudentFeedbackComponent feedback={state.results.studentFeedback} sections={sections} />
          </Suspense>
        )}
      </div>

      {/* Modals and Toast */}
      <SaveDialog
        isOpen={state.ui.showSaveDialog}
        onClose={() => dispatch({ type: 'HIDE_SAVE_DIALOG' })}
        onSave={performSave}
        defaultName={state.ui.saveDialogName}
      />

      <ConfirmDialog
        isOpen={state.ui.showConfirmNew}
        onClose={() => dispatch({ type: 'HIDE_CONFIRM_NEW' })}
        onConfirm={() => dispatch({ type: 'CLEAR_ANALYSIS' })}
        title="Byrja nýja greiningu?"
        message="Þú ert með óvistaðar niðurstöður. Viltu vista áður en þú byrjar nýja greiningu?"
        confirmText="Eyða án þess að vista"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={state.ui.showDeleteDialog}
        onClose={() => dispatch({ type: 'HIDE_DELETE_DIALOG' })}
        onConfirm={confirmDelete}
        title="Eyða greiningu?"
        message="Ertu viss um að þú viljir eyða þessari greiningu? Þetta er ekki hægt að afturkalla."
        confirmText="Eyða"
        confirmVariant="danger"
      />

      <Toast toast={state.ui.toast} />
    </div>
  );
}

export { App };
