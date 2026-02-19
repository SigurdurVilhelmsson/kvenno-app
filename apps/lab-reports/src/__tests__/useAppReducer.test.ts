// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useAppReducer, initialState } from '../hooks/useAppReducer';
import type { AnalysisResult, StudentFeedback, GradingSession } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal teacher analysis result for testing */
function makeAnalysisResult(filename: string): AnalysisResult {
  return {
    filename,
    suggestedGrade: '8',
    totalPoints: 25,
    maxTotalPoints: 30,
    sections: {
      intro: { present: true, quality: 'good', points: 5, maxPoints: 5 },
    },
  };
}

/** Minimal student feedback result for testing */
function makeStudentFeedback(filename: string): StudentFeedback {
  return {
    filename,
    totalPoints: 20,
    maxTotalPoints: 30,
    sections: {
      intro: { present: true, points: 4, maxPoints: 5, strengths: ['Good intro'] },
    },
    nextSteps: ['Improve conclusion'],
  };
}

/** Minimal grading session for testing */
function makeSession(overrides: Partial<GradingSession> = {}): GradingSession {
  return {
    id: 'session-1',
    name: 'Test Session',
    experiment: 'jafnvaegi',
    timestamp: '2026-02-19T12:00:00Z',
    results: [makeAnalysisResult('report.docx')],
    fileCount: 1,
    mode: 'teacher',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Initial state
// ---------------------------------------------------------------------------
describe('initialState', () => {
  it('has correct default values', () => {
    expect(initialState.mode).toBe('teacher');
    expect(initialState.view).toBe('grader');
    expect(initialState.selectedExperiment).toBe('jafnvaegi');
    expect(initialState.ui.showInfo).toBe(false);
    expect(initialState.ui.showSaveDialog).toBe(false);
    expect(initialState.ui.showConfirmNew).toBe(false);
    expect(initialState.ui.showDeleteDialog).toBe(false);
    expect(initialState.ui.toast).toEqual({ show: false, message: '', type: 'success' });
    expect(initialState.files.list).toEqual([]);
    expect(initialState.files.processing).toBe(false);
    expect(initialState.files.status).toEqual({ current: 0, total: 0, currentFile: '' });
    expect(initialState.results.analyses).toEqual([]);
    expect(initialState.results.studentFeedback).toEqual([]);
    expect(initialState.session.saved).toEqual([]);
    expect(initialState.session.currentName).toBe('');
    expect(initialState.session.currentId).toBe('');
    expect(initialState.session.isSaved).toBe(false);
    expect(initialState.session.toDelete).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. useAppReducer hook returns expected shape
// ---------------------------------------------------------------------------
describe('useAppReducer hook shape', () => {
  it('returns state, dispatch, and showToast', () => {
    const { result } = renderHook(() => useAppReducer());

    expect(result.current.state).toEqual(initialState);
    expect(typeof result.current.dispatch).toBe('function');
    expect(typeof result.current.showToast).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 3. SET_MODE
// ---------------------------------------------------------------------------
describe('SET_MODE action', () => {
  it('switches mode to student', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SET_MODE', mode: 'student' });
    });

    expect(result.current.state.mode).toBe('student');
  });

  it('switches mode back to teacher', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SET_MODE', mode: 'student' });
    });
    act(() => {
      result.current.dispatch({ type: 'SET_MODE', mode: 'teacher' });
    });

    expect(result.current.state.mode).toBe('teacher');
  });
});

// ---------------------------------------------------------------------------
// 4. SET_VIEW
// ---------------------------------------------------------------------------
describe('SET_VIEW action', () => {
  it('switches view to history', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SET_VIEW', view: 'history' });
    });

    expect(result.current.state.view).toBe('history');
  });
});

// ---------------------------------------------------------------------------
// 5. SET_EXPERIMENT
// ---------------------------------------------------------------------------
describe('SET_EXPERIMENT action', () => {
  it('updates selectedExperiment', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SET_EXPERIMENT', experiment: 'titrun' });
    });

    expect(result.current.state.selectedExperiment).toBe('titrun');
  });
});

// ---------------------------------------------------------------------------
// 6. TOGGLE_INFO
// ---------------------------------------------------------------------------
describe('TOGGLE_INFO action', () => {
  it('toggles showInfo from false to true', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_INFO' });
    });

    expect(result.current.state.ui.showInfo).toBe(true);
  });

  it('toggles showInfo back to false', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_INFO' });
    });
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_INFO' });
    });

    expect(result.current.state.ui.showInfo).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. SHOW_SAVE_DIALOG / HIDE_SAVE_DIALOG
// ---------------------------------------------------------------------------
describe('SHOW_SAVE_DIALOG and HIDE_SAVE_DIALOG actions', () => {
  it('opens save dialog with default name', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_SAVE_DIALOG', defaultName: 'My Session' });
    });

    expect(result.current.state.ui.showSaveDialog).toBe(true);
    expect(result.current.state.ui.saveDialogName).toBe('My Session');
  });

  it('closes save dialog', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_SAVE_DIALOG', defaultName: 'My Session' });
    });
    act(() => {
      result.current.dispatch({ type: 'HIDE_SAVE_DIALOG' });
    });

    expect(result.current.state.ui.showSaveDialog).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. SHOW_CONFIRM_NEW / HIDE_CONFIRM_NEW
// ---------------------------------------------------------------------------
describe('SHOW_CONFIRM_NEW and HIDE_CONFIRM_NEW actions', () => {
  it('opens confirm new dialog', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_CONFIRM_NEW' });
    });

    expect(result.current.state.ui.showConfirmNew).toBe(true);
  });

  it('closes confirm new dialog', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_CONFIRM_NEW' });
    });
    act(() => {
      result.current.dispatch({ type: 'HIDE_CONFIRM_NEW' });
    });

    expect(result.current.state.ui.showConfirmNew).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9. SHOW_DELETE_DIALOG / HIDE_DELETE_DIALOG
// ---------------------------------------------------------------------------
describe('SHOW_DELETE_DIALOG and HIDE_DELETE_DIALOG actions', () => {
  it('opens delete dialog and stores session id', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_DELETE_DIALOG', sessionId: 'sess-42' });
    });

    expect(result.current.state.ui.showDeleteDialog).toBe(true);
    expect(result.current.state.session.toDelete).toBe('sess-42');
  });

  it('closes delete dialog and clears toDelete', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_DELETE_DIALOG', sessionId: 'sess-42' });
    });
    act(() => {
      result.current.dispatch({ type: 'HIDE_DELETE_DIALOG' });
    });

    expect(result.current.state.ui.showDeleteDialog).toBe(false);
    expect(result.current.state.session.toDelete).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 10. SHOW_TOAST / HIDE_TOAST
// ---------------------------------------------------------------------------
describe('SHOW_TOAST and HIDE_TOAST actions', () => {
  it('shows a toast with message and type', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_TOAST', message: 'Saved!', toastType: 'success' });
    });

    expect(result.current.state.ui.toast).toEqual({
      show: true,
      message: 'Saved!',
      type: 'success',
    });
  });

  it('hides toast and resets fields', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_TOAST', message: 'Error', toastType: 'error' });
    });
    act(() => {
      result.current.dispatch({ type: 'HIDE_TOAST' });
    });

    expect(result.current.state.ui.toast).toEqual({
      show: false,
      message: '',
      type: 'success',
    });
  });
});

// ---------------------------------------------------------------------------
// 11. SET_FILES
// ---------------------------------------------------------------------------
describe('SET_FILES action', () => {
  it('sets file list', () => {
    const { result } = renderHook(() => useAppReducer());
    const files = [new File(['a'], 'report.docx')];

    act(() => {
      result.current.dispatch({ type: 'SET_FILES', files });
    });

    expect(result.current.state.files.list).toHaveLength(1);
    expect(result.current.state.files.list[0].name).toBe('report.docx');
  });

  it('clears existing results when new files are set', () => {
    const { result } = renderHook(() => useAppReducer());

    // First, finish processing to populate results
    act(() => {
      result.current.dispatch({
        type: 'FINISH_PROCESSING',
        results: [makeAnalysisResult('old.docx')],
        mode: 'teacher',
      });
    });
    expect(result.current.state.results.analyses).toHaveLength(1);

    // Now set new files -- results should be cleared
    act(() => {
      result.current.dispatch({ type: 'SET_FILES', files: [new File(['b'], 'new.docx')] });
    });

    expect(result.current.state.results.analyses).toEqual([]);
    expect(result.current.state.results.studentFeedback).toEqual([]);
  });

  it('marks session as unsaved', () => {
    const { result } = renderHook(() => useAppReducer());

    // Mark session as saved first
    act(() => {
      result.current.dispatch({ type: 'SESSION_SAVED', name: 'Test', id: 'id-1' });
    });
    expect(result.current.state.session.isSaved).toBe(true);

    // Setting new files should mark as unsaved
    act(() => {
      result.current.dispatch({ type: 'SET_FILES', files: [] });
    });

    expect(result.current.state.session.isSaved).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 12. START_PROCESSING
// ---------------------------------------------------------------------------
describe('START_PROCESSING action', () => {
  it('sets processing to true and initialises status', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'START_PROCESSING', total: 5 });
    });

    expect(result.current.state.files.processing).toBe(true);
    expect(result.current.state.files.status).toEqual({
      current: 0,
      total: 5,
      currentFile: '',
    });
  });
});

// ---------------------------------------------------------------------------
// 13. UPDATE_PROCESSING_STATUS
// ---------------------------------------------------------------------------
describe('UPDATE_PROCESSING_STATUS action', () => {
  it('updates current count and file name', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'START_PROCESSING', total: 3 });
    });
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_PROCESSING_STATUS',
        current: 2,
        currentFile: 'report2.docx',
      });
    });

    expect(result.current.state.files.status.current).toBe(2);
    expect(result.current.state.files.status.currentFile).toBe('report2.docx');
    // total should remain unchanged
    expect(result.current.state.files.status.total).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 14. FINISH_PROCESSING -- teacher mode
// ---------------------------------------------------------------------------
describe('FINISH_PROCESSING action', () => {
  it('routes teacher results to analyses', () => {
    const { result } = renderHook(() => useAppReducer());
    const analyses = [makeAnalysisResult('a.docx'), makeAnalysisResult('b.docx')];

    act(() => {
      result.current.dispatch({ type: 'START_PROCESSING', total: 2 });
    });
    act(() => {
      result.current.dispatch({ type: 'FINISH_PROCESSING', results: analyses, mode: 'teacher' });
    });

    expect(result.current.state.results.analyses).toHaveLength(2);
    expect(result.current.state.results.analyses[0].filename).toBe('a.docx');
    expect(result.current.state.results.studentFeedback).toEqual([]);
    expect(result.current.state.files.processing).toBe(false);
    expect(result.current.state.files.status).toEqual({ current: 0, total: 0, currentFile: '' });
  });

  it('routes student results to studentFeedback', () => {
    const { result } = renderHook(() => useAppReducer());
    const feedback = [makeStudentFeedback('c.docx')];

    act(() => {
      result.current.dispatch({ type: 'START_PROCESSING', total: 1 });
    });
    act(() => {
      result.current.dispatch({ type: 'FINISH_PROCESSING', results: feedback, mode: 'student' });
    });

    expect(result.current.state.results.studentFeedback).toHaveLength(1);
    expect(result.current.state.results.studentFeedback[0].filename).toBe('c.docx');
    expect(result.current.state.results.analyses).toEqual([]);
    expect(result.current.state.files.processing).toBe(false);
  });

  it('marks session as unsaved after finishing', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SESSION_SAVED', name: 'Saved', id: 'id-1' });
    });
    act(() => {
      result.current.dispatch({
        type: 'FINISH_PROCESSING',
        results: [makeAnalysisResult('x.docx')],
        mode: 'teacher',
      });
    });

    expect(result.current.state.session.isSaved).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 15. SET_SAVED_SESSIONS
// ---------------------------------------------------------------------------
describe('SET_SAVED_SESSIONS action', () => {
  it('stores the list of saved sessions', () => {
    const { result } = renderHook(() => useAppReducer());
    const sessions = [makeSession(), makeSession({ id: 'session-2', name: 'Second' })];

    act(() => {
      result.current.dispatch({ type: 'SET_SAVED_SESSIONS', sessions });
    });

    expect(result.current.state.session.saved).toHaveLength(2);
    expect(result.current.state.session.saved[1].name).toBe('Second');
  });
});

// ---------------------------------------------------------------------------
// 16. SESSION_SAVED
// ---------------------------------------------------------------------------
describe('SESSION_SAVED action', () => {
  it('stores current name and id and marks saved', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_SAVE_DIALOG', defaultName: 'default' });
    });
    act(() => {
      result.current.dispatch({ type: 'SESSION_SAVED', name: 'My Grading', id: 'abc-123' });
    });

    expect(result.current.state.session.currentName).toBe('My Grading');
    expect(result.current.state.session.currentId).toBe('abc-123');
    expect(result.current.state.session.isSaved).toBe(true);
    // Should also close the save dialog
    expect(result.current.state.ui.showSaveDialog).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 17. SESSION_LOADED
// ---------------------------------------------------------------------------
describe('SESSION_LOADED action', () => {
  it('restores mode, experiment, and teacher results from session', () => {
    const { result } = renderHook(() => useAppReducer());
    const session = makeSession({
      mode: 'teacher',
      experiment: 'titrun',
      results: [makeAnalysisResult('loaded.docx')],
    });

    act(() => {
      result.current.dispatch({ type: 'SESSION_LOADED', session });
    });

    expect(result.current.state.mode).toBe('teacher');
    expect(result.current.state.selectedExperiment).toBe('titrun');
    expect(result.current.state.view).toBe('grader');
    expect(result.current.state.results.analyses).toHaveLength(1);
    expect(result.current.state.results.analyses[0].filename).toBe('loaded.docx');
    expect(result.current.state.results.studentFeedback).toEqual([]);
    expect(result.current.state.session.currentName).toBe('Test Session');
    expect(result.current.state.session.currentId).toBe('session-1');
    expect(result.current.state.session.isSaved).toBe(true);
  });

  it('restores student feedback when session mode is student', () => {
    const { result } = renderHook(() => useAppReducer());
    const session = makeSession({
      mode: 'student',
      results: [makeStudentFeedback('student.docx')],
    });

    act(() => {
      result.current.dispatch({ type: 'SESSION_LOADED', session });
    });

    expect(result.current.state.mode).toBe('student');
    expect(result.current.state.results.studentFeedback).toHaveLength(1);
    expect(result.current.state.results.studentFeedback[0].filename).toBe('student.docx');
    expect(result.current.state.results.analyses).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 18. SESSION_DELETED
// ---------------------------------------------------------------------------
describe('SESSION_DELETED action', () => {
  it('closes delete dialog and clears toDelete', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SHOW_DELETE_DIALOG', sessionId: 'sess-99' });
    });
    act(() => {
      result.current.dispatch({ type: 'SESSION_DELETED' });
    });

    expect(result.current.state.ui.showDeleteDialog).toBe(false);
    expect(result.current.state.session.toDelete).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 19. CLEAR_ANALYSIS
// ---------------------------------------------------------------------------
describe('CLEAR_ANALYSIS action', () => {
  it('resets files, results, session info, and closes confirm dialog', () => {
    const { result } = renderHook(() => useAppReducer());

    // Build up state: set files, finish processing, save session, open confirm
    act(() => {
      result.current.dispatch({ type: 'SET_FILES', files: [new File(['x'], 'r.docx')] });
    });
    act(() => {
      result.current.dispatch({
        type: 'FINISH_PROCESSING',
        results: [makeAnalysisResult('r.docx')],
        mode: 'teacher',
      });
    });
    act(() => {
      result.current.dispatch({ type: 'SESSION_SAVED', name: 'Saved', id: 'id-99' });
    });
    act(() => {
      result.current.dispatch({ type: 'SHOW_CONFIRM_NEW' });
    });

    // Verify state is populated
    expect(result.current.state.results.analyses).toHaveLength(1);
    expect(result.current.state.session.currentName).toBe('Saved');
    expect(result.current.state.ui.showConfirmNew).toBe(true);

    // Clear
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ANALYSIS' });
    });

    expect(result.current.state.files.list).toEqual([]);
    expect(result.current.state.files.processing).toBe(false);
    expect(result.current.state.files.status).toEqual({ current: 0, total: 0, currentFile: '' });
    expect(result.current.state.results.analyses).toEqual([]);
    expect(result.current.state.results.studentFeedback).toEqual([]);
    expect(result.current.state.session.currentName).toBe('');
    expect(result.current.state.session.currentId).toBe('');
    expect(result.current.state.session.isSaved).toBe(false);
    expect(result.current.state.ui.showConfirmNew).toBe(false);
  });

  it('preserves mode and experiment when clearing', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.dispatch({ type: 'SET_MODE', mode: 'student' });
    });
    act(() => {
      result.current.dispatch({ type: 'SET_EXPERIMENT', experiment: 'titrun' });
    });
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ANALYSIS' });
    });

    expect(result.current.state.mode).toBe('student');
    expect(result.current.state.selectedExperiment).toBe('titrun');
  });
});

// ---------------------------------------------------------------------------
// 20. showToast convenience function
// ---------------------------------------------------------------------------
describe('showToast convenience function', () => {
  it('dispatches SHOW_TOAST with default success type', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.showToast('Operation complete');
    });

    expect(result.current.state.ui.toast).toEqual({
      show: true,
      message: 'Operation complete',
      type: 'success',
    });
  });

  it('dispatches SHOW_TOAST with explicit error type', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.showToast('Something failed', 'error');
    });

    expect(result.current.state.ui.toast).toEqual({
      show: true,
      message: 'Something failed',
      type: 'error',
    });
  });

  it('dispatches SHOW_TOAST with warning type', () => {
    const { result } = renderHook(() => useAppReducer());

    act(() => {
      result.current.showToast('Be careful', 'warning');
    });

    expect(result.current.state.ui.toast.type).toBe('warning');
  });
});
