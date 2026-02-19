import React from 'react';
import { CheckCircle, XCircle, Lightbulb, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { StudentFeedback as StudentFeedbackType, ExperimentSection } from '@/types';
import { ExtractionDebug } from './ExtractionDebug';
import { isExtractionDebugEnabled } from '../utils/extractionDebug';

interface StudentFeedbackProps {
  feedback: StudentFeedbackType[];
  sections: ExperimentSection[];
  onRetry?: () => void;
  onClose?: () => void;
}

// Helper function to parse comments with numbered lists
const parseCommentWithList = (text: string | undefined): JSX.Element => {
  if (!text) return <span>{text}</span>;

  const hasNumberedList = /\d+[).]\s/.test(text);

  if (!hasNumberedList) {
    return <p className="text-slate-700">{text}</p>;
  }

  const parts = text.split(/(?=\d+[).]\s)/);
  const beforeList = parts[0];
  const listItems = parts.slice(1);

  return (
    <div className="text-slate-700">
      {beforeList && <p className="mb-2">{beforeList}</p>}
      {listItems.length > 0 && (
        <ol className="list-decimal list-inside space-y-1">
          {listItems.map((item, i) => {
            const cleanedItem = item.replace(/^\d+[).]\s*/, '');
            return <li key={i}>{cleanedItem}</li>;
          })}
        </ol>
      )}
    </div>
  );
};

export const StudentFeedback: React.FC<StudentFeedbackProps> = ({
  feedback,
  sections,
  onRetry,
  onClose,
}) => {
  if (feedback.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Endurgjöf á skýrsluna þína</h2>

      <div className="space-y-8">
        {feedback.map((item, idx) => (
          <div key={idx} className="border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{item.filename}</h3>

            {/* Overall Grade */}
            {(item.heildareinkunn || item.totalPoints !== undefined) && (
              <div className="bg-orange-50 border-l-4 border-kvenno-orange p-4 mb-6">
                <p className="text-2xl font-bold text-slate-900">
                  Áætluð einkunn:{' '}
                  {item.heildareinkunn ||
                    `${item.totalPoints}/${item.maxTotalPoints || 30}`}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Þetta er til leiðbeiningar - raunveruleg einkunn kemur frá kennara
                </p>
              </div>
            )}

            {/* Strengths (styrkir) */}
            {item.styrkir && item.styrkir.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Styrkir
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {item.styrkir.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* General Comments (almennarAthugasemdir) */}
            {item.almennarAthugasemdir && item.almennarAthugasemdir.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Almennar athugasemdir
                </h4>
                <div className="space-y-2">
                  {item.almennarAthugasemdir.map((a, i) => (
                    <div key={i}>{parseCommentWithList(a)}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Assessment (fallback if using English version) */}
            {item.overallAssessment && !item.almennarAthugasemdir && (
              <div className="bg-orange-50 border border-kvenno-orange rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Target size={20} />
                  Heildarmat
                </h4>
                <p className="text-slate-700">{item.overallAssessment}</p>
              </div>
            )}

            {/* Section Feedback */}
            <div className="space-y-4 mb-6">
              <h4 className="font-bold text-slate-800">Endurgjöf eftir köflum:</h4>
              {sections.map((section) => {
                const sectionData = item.sections[section.id];
                if (!sectionData) return null;

                return (
                  <div
                    key={section.id}
                    className={`border rounded-lg p-4 ${
                      sectionData.present
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        {sectionData.present ? (
                          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                        ) : (
                          <XCircle className="text-red-600 flex-shrink-0" size={20} />
                        )}
                        <h4 className="font-semibold text-slate-800">
                          {section.name}
                          {section.maxPoints && ` (${section.maxPoints} stig)`}
                        </h4>
                      </div>
                      {sectionData.points !== undefined && (
                        <span className="text-sm font-semibold text-orange-800">
                          {sectionData.points}/{sectionData.maxPoints || section.maxPoints} stig
                        </span>
                      )}
                    </div>

                    {sectionData.present ? (
                      <div className="ml-8 space-y-3">
                        {/* Strengths */}
                        {sectionData.strengths && sectionData.strengths.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                              <CheckCircle size={16} />
                              Vel gert:
                            </div>
                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                              {sectionData.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Improvements */}
                        {sectionData.improvements && sectionData.improvements.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-yellow-700 mb-1 flex items-center gap-1">
                              <TrendingUp size={16} />
                              Mætti bæta:
                            </div>
                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                              {sectionData.improvements.map((improvement, i) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {sectionData.suggestions && sectionData.suggestions.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Lightbulb size={16} />
                              Tillögur:
                            </div>
                            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                              {sectionData.suggestions.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Icelandic comments (athugasemdir) */}
                        {sectionData.athugasemdir && (
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-1">
                              Athugasemdir:
                            </div>
                            {parseCommentWithList(sectionData.athugasemdir)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="ml-8 text-sm text-red-700">
                        Þessi hluti vantar í skýrsluna. {section.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next Steps - Icelandic version (næstuSkref) */}
            {item.næstuSkref && item.næstuSkref.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <h4 className="font-bold text-yellow-900 mb-2">Næstu skref:</h4>
                <ol className="list-decimal list-inside space-y-1 text-yellow-900">
                  {item.næstuSkref.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Next Steps - English fallback */}
            {!item.næstuSkref && item.nextSteps && item.nextSteps.length > 0 && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Target size={20} />
                  Næstu skref
                </h4>
                <ul className="list-decimal list-inside text-sm text-slate-700 space-y-1">
                  {item.nextSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Debug information (only shown when localStorage.debug-extraction = 'true') */}
            {isExtractionDebugEnabled() && item.extractionDebug && (
              <ExtractionDebug
                fileContent={{
                  type: 'pdf',
                  data: '',
                  debug: item.extractionDebug
                }}
                fileName={item.filename}
              />
            )}

            {/* Action buttons */}
            {(onRetry || onClose) && (
              <div className="flex gap-4 mt-6">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex-1 bg-kvenno-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
                  >
                    Senda inn aftur
                  </button>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition"
                  >
                    Loka
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
