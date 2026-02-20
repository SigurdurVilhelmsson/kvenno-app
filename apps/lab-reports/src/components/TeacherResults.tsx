import React from 'react';

import { CheckCircle, XCircle, AlertTriangle, Download, Save } from 'lucide-react';

import { ExtractionDebug } from './ExtractionDebug';
import { isExtractionDebugEnabled } from '../utils/extractionDebug';

import { AnalysisResult, ExperimentSection } from '@/types';

interface TeacherResultsProps {
  results: AnalysisResult[];
  sections: ExperimentSection[];
  sessionName?: string;
  onSave: () => void;
  onExport: () => void;
}

const getQualityIcon = (quality?: string) => {
  if (quality === 'good') return <CheckCircle className="text-green-600" size={20} />;
  if (quality === 'needs improvement') return <AlertTriangle className="text-yellow-600" size={20} />;
  return <XCircle className="text-red-600" size={20} />;
};

const getQualityColor = (quality?: string) => {
  if (quality === 'good') return 'bg-green-50 border-green-300';
  if (quality === 'needs improvement') return 'bg-yellow-50 border-yellow-300';
  return 'bg-red-50 border-red-300';
};

const getQualityLabel = (quality?: string) => {
  if (quality === 'good') return 'Gott';
  if (quality === 'needs improvement') return 'Þarf að bæta';
  if (quality === 'unsatisfactory') return 'Ófullnægjandi';
  return 'N/A';
};

export const TeacherResults: React.FC<TeacherResultsProps> = ({
  results,
  sections,
  sessionName,
  onSave,
  onExport,
}) => {
  if (results.length === 0) return null;

  return (
    <div className="bg-surface-raised rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading text-warm-900">
          Niðurstöður
          {sessionName && <span className="text-lg text-warm-600 ml-3">- {sessionName}</span>}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Save size={20} />
            Vista greiningu
          </button>
          <button
            onClick={onExport}
            className="bg-kvenno-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Download size={20} />
            Niðurhala CSV
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {results.map((result, idx) => (
          <div key={idx} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-warm-800">{result.filename}</h3>
              {(result.suggestedGrade || (result.totalPoints !== undefined && result.maxTotalPoints !== undefined)) && (
                <div className="text-right">
                  <div className="text-sm text-warm-600">Tillaga að einkunn:</div>
                  <div className="text-2xl font-bold text-warm-900">
                    {result.suggestedGrade || `${result.totalPoints}/${result.maxTotalPoints}`}
                  </div>
                  {result.totalPoints !== undefined && result.maxTotalPoints !== undefined && (
                    <div className="text-xs text-warm-500 mt-1">
                      ({result.totalPoints} af {result.maxTotalPoints} stigum)
                    </div>
                  )}
                </div>
              )}
            </div>

            {result.error ? (
              <div className="bg-red-50 border border-red-300 rounded p-4 text-red-800">
                Villa: {result.error}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sections.map((section) => {
                  const data = result.sections?.[section.id];
                  if (!data) return null;

                  return (
                    <div
                      key={section.id}
                      className={`border rounded-lg p-4 ${
                        data.present ? getQualityColor(data.quality) : 'bg-warm-50 border-warm-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        {data.present ? (
                          getQualityIcon(data.quality)
                        ) : (
                          <XCircle className="text-warm-400" size={20} />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-warm-800">{section.name}</h4>
                            {data.points !== undefined && data.maxPoints !== undefined && (
                              <span className="text-sm font-bold text-warm-700 bg-white/50 px-2 py-0.5 rounded">
                                {data.points}/{data.maxPoints} stig
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            {data.present ? (
                              <>
                                <span className="font-medium">{getQualityLabel(data.quality)}</span>
                                {data.note && <div className="text-warm-600 mt-1">{data.note}</div>}
                                {data.reasoning && (
                                  <div className="mt-2 pt-2 border-t border-warm-300">
                                    <span className="font-semibold text-warm-700">Rökstuðningur: </span>
                                    <span className="text-warm-700">{data.reasoning}</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-warm-600">Vantar</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Debug information (only shown when localStorage.debug-extraction = 'true') */}
            {isExtractionDebugEnabled() && result.extractionDebug && (
              <ExtractionDebug
                fileContent={{
                  type: 'pdf',
                  data: '',
                  debug: result.extractionDebug
                }}
                fileName={result.filename}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
