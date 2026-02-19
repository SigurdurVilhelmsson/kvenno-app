import { useReducer, useCallback } from 'react';

import {
  AppMode,
  AnalysisResult,
  StudentFeedback,
  ProcessingStatus,
  Toast,
  GradingSession,
} from '../types';

type View = 'grader' | 'history';

export interface AppState {
  mode: AppMode;
  view: View;
  selectedExperiment: string;
  ui: {
    showInfo: boolean;
    showSaveDialog: boolean;
    saveDialogName: string;
    showConfirmNew: boolean;
    showDeleteDialog: boolean;
    toast: Toast;
  };
  files: {
    list: File[];
    processing: boolean;
    status: ProcessingStatus;
  };
  results: {
    analyses: AnalysisResult[];
    studentFeedback: StudentFeedback[];
  };
  session: {
    saved: GradingSession[];
    currentName: string;
    currentId: string;
    isSaved: boolean;
    toDelete: string | null;
  };
}

type AppAction =
  | { type: 'SET_MODE'; mode: AppMode }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_EXPERIMENT'; experiment: string }
  | { type: 'TOGGLE_INFO' }
  | { type: 'SHOW_SAVE_DIALOG'; defaultName: string }
  | { type: 'HIDE_SAVE_DIALOG' }
  | { type: 'SHOW_CONFIRM_NEW' }
  | { type: 'HIDE_CONFIRM_NEW' }
  | { type: 'SHOW_DELETE_DIALOG'; sessionId: string }
  | { type: 'HIDE_DELETE_DIALOG' }
  | { type: 'SHOW_TOAST'; message: string; toastType: Toast['type'] }
  | { type: 'HIDE_TOAST' }
  | { type: 'SET_FILES'; files: File[] }
  | { type: 'START_PROCESSING'; total: number }
  | { type: 'UPDATE_PROCESSING_STATUS'; current: number; currentFile: string }
  | { type: 'FINISH_PROCESSING'; results: AnalysisResult[]; mode: 'teacher' }
  | { type: 'FINISH_PROCESSING'; results: StudentFeedback[]; mode: 'student' }
  | { type: 'SET_SAVED_SESSIONS'; sessions: GradingSession[] }
  | { type: 'SESSION_SAVED'; name: string; id: string }
  | { type: 'SESSION_LOADED'; session: GradingSession }
  | { type: 'SESSION_DELETED' }
  | { type: 'CLEAR_ANALYSIS' };

const initialProcessingStatus: ProcessingStatus = {
  current: 0,
  total: 0,
  currentFile: '',
};

export const initialState: AppState = {
  mode: 'teacher',
  view: 'grader',
  selectedExperiment: 'jafnvaegi',
  ui: {
    showInfo: false,
    showSaveDialog: false,
    saveDialogName: '',
    showConfirmNew: false,
    showDeleteDialog: false,
    toast: { show: false, message: '', type: 'success' },
  },
  files: {
    list: [],
    processing: false,
    status: initialProcessingStatus,
  },
  results: {
    analyses: [],
    studentFeedback: [],
  },
  session: {
    saved: [],
    currentName: '',
    currentId: '',
    isSaved: false,
    toDelete: null,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'SET_EXPERIMENT':
      return { ...state, selectedExperiment: action.experiment };

    case 'TOGGLE_INFO':
      return { ...state, ui: { ...state.ui, showInfo: !state.ui.showInfo } };

    case 'SHOW_SAVE_DIALOG':
      return {
        ...state,
        ui: { ...state.ui, showSaveDialog: true, saveDialogName: action.defaultName },
      };

    case 'HIDE_SAVE_DIALOG':
      return { ...state, ui: { ...state.ui, showSaveDialog: false } };

    case 'SHOW_CONFIRM_NEW':
      return { ...state, ui: { ...state.ui, showConfirmNew: true } };

    case 'HIDE_CONFIRM_NEW':
      return { ...state, ui: { ...state.ui, showConfirmNew: false } };

    case 'SHOW_DELETE_DIALOG':
      return {
        ...state,
        ui: { ...state.ui, showDeleteDialog: true },
        session: { ...state.session, toDelete: action.sessionId },
      };

    case 'HIDE_DELETE_DIALOG':
      return {
        ...state,
        ui: { ...state.ui, showDeleteDialog: false },
        session: { ...state.session, toDelete: null },
      };

    case 'SHOW_TOAST':
      return {
        ...state,
        ui: { ...state.ui, toast: { show: true, message: action.message, type: action.toastType } },
      };

    case 'HIDE_TOAST':
      return {
        ...state,
        ui: { ...state.ui, toast: { show: false, message: '', type: 'success' } },
      };

    case 'SET_FILES':
      return {
        ...state,
        files: { ...state.files, list: action.files },
        results: { analyses: [], studentFeedback: [] },
        session: { ...state.session, isSaved: false },
      };

    case 'START_PROCESSING':
      return {
        ...state,
        files: {
          ...state.files,
          processing: true,
          status: { current: 0, total: action.total, currentFile: '' },
        },
      };

    case 'UPDATE_PROCESSING_STATUS':
      return {
        ...state,
        files: {
          ...state.files,
          status: { ...state.files.status, current: action.current, currentFile: action.currentFile },
        },
      };

    case 'FINISH_PROCESSING':
      if (action.mode === 'teacher') {
        return {
          ...state,
          files: { ...state.files, processing: false, status: initialProcessingStatus },
          results: { ...state.results, analyses: action.results as AnalysisResult[] },
          session: { ...state.session, isSaved: false },
        };
      }
      return {
        ...state,
        files: { ...state.files, processing: false, status: initialProcessingStatus },
        results: { ...state.results, studentFeedback: action.results as StudentFeedback[] },
        session: { ...state.session, isSaved: false },
      };

    case 'SET_SAVED_SESSIONS':
      return { ...state, session: { ...state.session, saved: action.sessions } };

    case 'SESSION_SAVED':
      return {
        ...state,
        session: { ...state.session, currentName: action.name, currentId: action.id, isSaved: true },
        ui: { ...state.ui, showSaveDialog: false },
      };

    case 'SESSION_LOADED': {
      const s = action.session;
      return {
        ...state,
        mode: s.mode,
        selectedExperiment: s.experiment,
        view: 'grader',
        results: {
          analyses: s.mode === 'teacher' ? (s.results as AnalysisResult[]) : [],
          studentFeedback: s.mode === 'student' ? (s.results as StudentFeedback[]) : [],
        },
        session: { ...state.session, currentName: s.name, currentId: s.id, isSaved: true },
      };
    }

    case 'SESSION_DELETED':
      return {
        ...state,
        ui: { ...state.ui, showDeleteDialog: false },
        session: { ...state.session, toDelete: null },
      };

    case 'CLEAR_ANALYSIS':
      return {
        ...state,
        files: { list: [], processing: false, status: initialProcessingStatus },
        results: { analyses: [], studentFeedback: [] },
        session: { ...state.session, currentName: '', currentId: '', isSaved: false },
        ui: { ...state.ui, showConfirmNew: false },
      };

    default:
      return state;
  }
}

export function useAppReducer() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    dispatch({ type: 'SHOW_TOAST', message, toastType: type });
  }, []);

  return { state, dispatch, showToast };
}

export type { AppAction, View };
