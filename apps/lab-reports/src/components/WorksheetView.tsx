import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { ExperimentConfig } from '@/types';

interface WorksheetViewProps {
  experiment: ExperimentConfig;
  onContinue: () => void;
  onBack: () => void;
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({
  experiment,
  onContinue,
  onBack,
}) => {
  if (!experiment.worksheet) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8">
        <p className="text-slate-600">Enginn vinnuseðill tiltækur fyrir þessa tilraun.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Til baka
        </button>
      </div>
    );
  }

  const { worksheet } = experiment;

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="text-kvenno-orange" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{experiment.title}</h2>
          <p className="text-slate-600">Vinnuseðill</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Reaction */}
        <div>
          <h3 className="font-bold text-slate-800 mb-2">Efnahvarf:</h3>
          <p className="bg-slate-50 p-3 rounded font-mono text-lg">{worksheet.reaction}</p>
        </div>

        {/* Materials */}
        <div>
          <h3 className="font-bold text-slate-800 mb-2">Efni:</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {worksheet.materials.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Equipment */}
        <div>
          <h3 className="font-bold text-slate-800 mb-2">Áhöld:</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {worksheet.equipment.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Procedure */}
        <div>
          <h3 className="font-bold text-slate-800 mb-2">Framkvæmd:</h3>
          <ul className="space-y-1 text-slate-700">
            {worksheet.steps.map((step, i) => (
              <li key={i} className={step.startsWith('  ') ? 'ml-8' : ''}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-200 text-slate-700 px-6 py-4 rounded-lg hover:bg-slate-300 transition font-semibold"
        >
          ← Til baka
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-kvenno-orange text-white px-6 py-4 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg font-semibold"
        >
          Halda áfram → Senda inn drög
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
