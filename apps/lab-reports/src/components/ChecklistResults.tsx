import React from 'react';

import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

import { Analysis2Result, ChecklistResult } from '@/types';

interface Props {
  result: Analysis2Result;
}

const StatusIcon = ({ status }: { status: boolean | 'needs_manual_check' }) => {
  if (status === true) return <CheckCircle className="text-green-600" size={18} />;
  if (status === false) return <XCircle className="text-red-600" size={18} />;
  return <HelpCircle className="text-amber-500" size={18} />;
};

const SECTION_NAMES: Record<string, string> = {
  uppsetning: 'Uppsetning kafla (10%)',
  framkvamd: 'Framkvæmd (5%)',
  nidurstodur_hluti1: 'Niðurstöður - Hluti 1: Handhitapoki',
  nidurstodur_hluti2: 'Niðurstöður - Hluti 2: NaOH og NH₄NO₃',
  umraedur: 'Umræður og ályktanir (10%)',
  fragangur: 'Frágangur (10%)',
};

function getSectionName(key: string): string {
  return SECTION_NAMES[key] || key;
}

function countByStatus(items: ChecklistResult[]): { present: number; missing: number; manual: number } {
  let present = 0;
  let missing = 0;
  let manual = 0;
  for (const item of items) {
    if (item.present === true) present++;
    else if (item.present === false) missing++;
    else manual++;
  }
  return { present, missing, manual };
}

export const ChecklistResults: React.FC<Props> = ({ result }) => {
  if (result.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Baseline Comparison */}
      {result.baselineComparison && (
        <div className={`p-4 rounded-lg border ${
          result.baselineComparison.overallVerdict === 'ok'
            ? 'bg-green-50 border-green-200'
            : result.baselineComparison.overallVerdict === 'warning'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-bold mb-2 flex items-center gap-2">
            {result.baselineComparison.overallVerdict === 'ok' && <CheckCircle className="text-green-600" size={20} />}
            {result.baselineComparison.overallVerdict === 'warning' && <AlertCircle className="text-amber-600" size={20} />}
            {result.baselineComparison.overallVerdict === 'mismatch' && <XCircle className="text-red-600" size={20} />}
            Samanburður við drög
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <StatusIcon status={result.baselineComparison.conceptsMatch} />
              <span>Hugtök stemma</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon status={result.baselineComparison.formulasMatch} />
              <span>Formúlur stemma</span>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon status={result.baselineComparison.languageRelated} />
              <span>Texti tengdur</span>
            </div>
          </div>
          {result.baselineComparison.notes && (
            <p className="mt-2 text-sm text-slate-700">{result.baselineComparison.notes}</p>
          )}
          {result.baselineComparison.conceptsMissing && result.baselineComparison.conceptsMissing.length > 0 && (
            <p className="mt-1 text-sm text-red-700">
              Hugtök sem vantar: {result.baselineComparison.conceptsMissing.join(', ')}
            </p>
          )}
          {result.baselineComparison.formulasMissing && result.baselineComparison.formulasMissing.length > 0 && (
            <p className="mt-1 text-sm text-red-700">
              Formúlur sem vantar: {result.baselineComparison.formulasMissing.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Checklist Sections */}
      {Object.entries(result.checklist).map(([sectionKey, items]) => {
        const counts = countByStatus(items);
        return (
        <div key={sectionKey} className="border rounded-lg p-4">
          <h3 className="font-bold mb-1 text-slate-800">
            {getSectionName(sectionKey)}
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            {counts.present} til staðar, {counts.missing} vantar
            {counts.manual > 0 && `, ${counts.manual} þarf yfirferð`}
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <StatusIcon status={item.present} />
                <div className="flex-1">
                  <span className={item.present === false ? 'text-red-700' : 'text-slate-700'}>
                    {item.label}
                  </span>
                  {item.note && (
                    <p className="text-sm text-slate-500 mt-0.5">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })}

      {/* Manual Checks Required */}
      {result.manualChecksRequired.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-bold mb-2 flex items-center gap-2 text-amber-800">
            <AlertCircle size={20} />
            Þarf yfirferð kennara
          </h3>
          <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
            {result.manualChecksRequired.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="bg-slate-100 rounded-lg p-4">
        <h3 className="font-bold mb-2">Samantekt</h3>
        <p className="text-slate-700">{result.summaryIcelandic}</p>
      </div>
    </div>
  );
};
