import { Category, Level, GuidingQuestion } from '../data/types';

interface SpurningaSpjaldProps {
  category: Category;
  level: Level;
}

const CONTEXT_COLORS: Record<string, { bg: string; text: string }> = {
  '📍': { bg: '#DC2626', text: '#FFFFFF' },
  '🕐': { bg: '#16A34A', text: '#FFFFFF' },
  '👤': { bg: '#EA580C', text: '#FFFFFF' },
  '🎯': { bg: '#2563EB', text: '#FFFFFF' },
};

const CONTEXT_ICONS = new Set(['📍', '🕐', '👤', '🎯']);

export function SpurningaSpjald({ category, level }: SpurningaSpjaldProps) {
  const mainQuestions = category.guidingQuestions.filter(
    (q) => !CONTEXT_ICONS.has(q.icon)
  );
  const contextQuestions = category.guidingQuestions.filter(
    (q) => CONTEXT_ICONS.has(q.icon)
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Spurningaspjald
      </h3>
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden border-2"
        style={{ borderColor: category.color }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: category.color }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.icon}</span>
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wide">
                {category.name}
              </h2>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
              {level}
            </span>
          </div>
        </div>

        {/* Main questions */}
        <div className="p-4 space-y-3">
          {mainQuestions.map((question, index) => (
            <QuestionBlock
              key={index}
              question={question}
              level={level}
              categoryColor={category.color}
            />
          ))}

          {/* Divider */}
          {contextQuestions.length > 0 && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Notagildi og samhengi
              </span>
              <div className="flex-1 border-t border-gray-300" />
            </div>
          )}

          {/* Context questions */}
          {contextQuestions.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {contextQuestions.map((question, index) => (
                <ContextCard
                  key={index}
                  question={question}
                  level={level}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Íslenskubraut — Kvennaskólinn í Reykjavík
          </p>
        </div>
      </div>
    </div>
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
      <div className="px-3 py-2 bg-gray-50">
        <p className="text-sm font-semibold text-gray-800">
          {question.question}
        </p>
        <p className="text-xs text-gray-500">
          {question.icon} {getQuestionLabel(question.icon)}
        </p>
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
}: {
  question: GuidingQuestion;
  level: Level;
}) {
  const answers = question.answers.find((a) => a.level === level);
  if (!answers || answers.options.length === 0) return null;

  const colors = CONTEXT_COLORS[question.icon] || {
    bg: '#6B7280',
    text: '#FFFFFF',
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: colors.bg + '15' }}
    >
      <div
        className="px-3 py-2 text-white"
        style={{ backgroundColor: colors.bg }}
      >
        <p className="text-xs font-bold">
          {question.icon} {question.question}
        </p>
      </div>
      <div className="px-3 py-2 space-y-1">
        {answers.options.map((option, index) => (
          <p
            key={index}
            className="text-xs font-medium"
            style={{ color: colors.bg }}
          >
            {option}
          </p>
        ))}
      </div>
    </div>
  );
}

function getQuestionLabel(icon: string): string {
  const labels: Record<string, string> = {
    '📚': 'Flokkar',
    '👁️': 'Útlit',
    '✋': 'Áferð',
    '🔊': 'Hljóð',
    '👃': 'Lykt',
    '👅': 'Bragð',
    '🧱': 'Efniviður',
    '🔷': 'Lögun',
    '🎯': 'Notagildi',
    '👤': 'Hver?',
    '📍': 'Hvar?',
    '🕐': 'Hvenær?',
  };
  return labels[icon] || '';
}
