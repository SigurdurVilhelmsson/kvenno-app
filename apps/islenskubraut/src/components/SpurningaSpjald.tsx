import { Sheet } from './Sheet';
import { Category, Level, GuidingQuestion } from '../data/types';

interface SpurningaSpjaldProps {
  category: Category;
  level: Level;
}

/** Page 3 of the printed card, laid out as the PDF lays it out. */
export function SpurningaSpjald({ category, level }: SpurningaSpjaldProps) {
  // Which questions are coloured context boxes is declared in the YAML (`context:`).
  const mainQuestions = category.guidingQuestions.filter((q) => !q.context);
  const contextQuestions = category.guidingQuestions.filter((q) => q.context);

  return (
    <Sheet category={category} level={level} page="Spurningaspjald" testId="spjald-spurningar">
      <p className="text-base font-bold text-gray-800 text-center mb-3">Spurningaspjald</p>

      <div className="space-y-2">
        {mainQuestions.map((question, index) => (
          <QuestionBlock
            key={index}
            question={question}
            level={level}
            categoryColor={category.color}
          />
        ))}
      </div>

      {contextQuestions.length > 0 && (
        <>
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Notagildi og samhengi
            </span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {contextQuestions.map(
              (question, index) =>
                question.context && (
                  <ContextCard
                    key={index}
                    question={question}
                    level={level}
                    color={question.context.color}
                  />
                )
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}

function QuestionBlock({
  question,
  level,
  categoryColor,
}: {
  question: GuidingQuestion;
  level: Level;
  categoryColor: string;
}) {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* The label sits beside the question, as on the printed card. */}
      <div className="px-3 py-1.5 bg-gray-50 flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{question.question}</p>
        <p className="text-xs text-gray-500 shrink-0">{question.label}</p>
      </div>
      <div className="px-3 py-2 flex flex-wrap gap-1.5">
        {answers.options.map((option, index) => (
          <span
            key={index}
            className="inline-block px-2 py-0.5 rounded-md text-xs font-medium border"
            style={{
              borderColor: categoryColor + '40',
              color: categoryColor,
              backgroundColor: categoryColor + '08',
            }}
          >
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContextCard({
  question,
  level,
  color,
}: {
  question: GuidingQuestion;
  level: Level;
  color: string;
}) {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: color + '15' }}>
      <div className="px-3 py-1.5 text-white" style={{ backgroundColor: color }}>
        <p className="text-xs font-bold">{question.question}</p>
      </div>
      {/* One wrapping line with separators, as on the printed card: each answer is kept
          whole, so a line breaks between answers, never inside one. */}
      <p className="px-3 py-1.5 text-xs font-bold leading-relaxed" style={{ color }}>
        {answers.options.map((option, index) => (
          <span key={index} className="inline-block mr-1">
            {index < answers.options.length - 1 ? `${option} ·` : option}
          </span>
        ))}
      </p>
    </div>
  );
}
