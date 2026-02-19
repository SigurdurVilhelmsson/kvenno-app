import React from 'react';
import { Trash2, GraduationCap, BookOpen } from 'lucide-react';
import { GradingSession } from '@/types';
import { experimentConfigs } from '@/config/experiments';

interface SessionHistoryProps {
  sessions: GradingSession[];
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  onLoadSession,
  onDeleteSession,
}) => {
  if (sessions.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Eldri greiningar</h2>
        <p className="text-slate-600 text-center py-8">Engar vistaðar greiningar</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Eldri greiningar</h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border rounded-lg p-4 flex justify-between items-center hover:border-kvenno-orange transition"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {session.mode === 'teacher' ? (
                  <GraduationCap className="text-kvenno-orange" size={24} />
                ) : (
                  <BookOpen className="text-green-600" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{session.name}</h3>
                <p className="text-sm text-slate-600">
                  {experimentConfigs[session.experiment]?.title || session.experiment} -{' '}
                  {session.fileCount} skýrslur
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-slate-500">
                    {new Date(session.timestamp).toLocaleString('is-IS')}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      session.mode === 'teacher'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {session.mode === 'teacher' ? 'Kennari' : 'Nemandi'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLoadSession(session.id)}
                className="bg-kvenno-orange text-white px-4 py-2 rounded hover:bg-orange-600 transition"
              >
                Opna
              </button>
              <button
                onClick={() => onDeleteSession(session.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
