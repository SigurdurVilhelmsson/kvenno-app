import React from 'react';
import { FileText, History } from 'lucide-react';
import { GradingSession } from '@/types';

interface StudentHomeProps {
  sessions: GradingSession[];
  onStartNew: () => void;
  onViewHistory: () => void;
}

interface Statistics {
  totalReports: number;
  totalSubmissions: number;
  avgSubmissionsPerReport: string;
  avgGrade: string;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  sessions,
  onStartNew,
  onViewHistory,
}) => {
  const getStatistics = (): Statistics => {
    if (sessions.length === 0) {
      return {
        totalReports: 0,
        totalSubmissions: 0,
        avgSubmissionsPerReport: '0.0',
        avgGrade: '0.0',
      };
    }

    // Group by unique session names/IDs
    const uniqueReports = new Set(sessions.map((s) => s.name));
    const totalReports = uniqueReports.size;
    const totalSubmissions = sessions.length;
    const avgSubmissionsPerReport =
      totalReports > 0 ? (totalSubmissions / totalReports).toFixed(1) : '0.0';

    // Calculate average grade from totalPoints
    const gradesWithPoints = sessions.filter((s) => s.results?.[0]?.totalPoints);
    const avgGrade =
      gradesWithPoints.length > 0
        ? (
            gradesWithPoints.reduce((sum, s) => sum + (s.results[0].totalPoints || 0), 0) /
            gradesWithPoints.length
          ).toFixed(1)
        : '0.0';

    return {
      totalReports,
      totalSubmissions,
      avgSubmissionsPerReport,
      avgGrade,
    };
  };

  const stats = getStatistics();

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Efnafræðiskýrslur</h1>
      <p className="text-slate-600 mb-6">Aðstoð við að skrifa skýrslur úr verklegum æfingum</p>

      <div className="bg-orange-50 border-l-4 border-kvenno-orange p-4 mb-6">
        <p className="text-sm text-orange-900">
          <strong>Athugið:</strong> Þetta app aðstoðar þig við að skrifa betri skýrslu, en
          skrifar hana ALDREI fyrir þig.
        </p>
      </div>

      {stats.totalSubmissions > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{stats.totalReports}</div>
            <div className="text-sm text-slate-700">Skýrslur</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{stats.totalSubmissions}</div>
            <div className="text-sm text-green-700">Innsendingar</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{stats.avgSubmissionsPerReport}</div>
            <div className="text-sm text-slate-700">Meðaltal/skýrsla</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">{stats.avgGrade}/30</div>
            <div className="text-sm text-orange-700">Meðaleinkunn</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 mb-6">
        <button
          onClick={onStartNew}
          className="bg-kvenno-orange text-white px-6 py-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <FileText size={24} />
          Byrja nýja skýrslu
        </button>

        {sessions.length > 0 && (
          <button
            onClick={onViewHistory}
            className="bg-slate-600 text-white px-6 py-4 rounded-lg hover:bg-slate-700 transition flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <History size={24} />
            Skoða sögu ({sessions.length} innsendingar)
          </button>
        )}
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Hvernig virkar þetta?</h2>
        <ol className="space-y-2 text-slate-700">
          <li className="flex gap-2">
            <span className="font-bold">1.</span> Veldu tilraun
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span> Skoðaðu vinnuseðil
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span> Skrifaðu skýrsluna í Word
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span> Hladdu upp Word skjalinu (.docx) eða skjámynd
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span> Fáðu endurgjöf og bættu skýrsluna
          </li>
          <li className="flex gap-2">
            <span className="font-bold">6.</span> Endurtaktu þar til þú ert ánægð/ur
          </li>
          <li className="flex gap-2">
            <span className="font-bold">7.</span> Skildu fullbúinni skýrslu í Innu
          </li>
        </ol>
      </div>
    </div>
  );
};
