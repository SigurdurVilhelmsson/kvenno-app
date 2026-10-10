import { Category, Level } from '../data/types';

interface SpjaldPreviewProps {
  category: Category;
  level: Level;
  view?: 'front' | 'back' | 'both';
}

export function SpjaldPreview({ category, level, view = 'both' }: SpjaldPreviewProps) {
  const sentenceFrame = category.sentenceFrames.find((sf) => sf.level === level);
  const example = category.examples.find((e) => e.level === level)?.text;
  const teacherNote = category.teacherNotes.find((n) => n.level === level)?.text;

  return (
    <div className="space-y-8">
      {/* Front side */}
      {(view === 'front' || view === 'both') && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Framhlið — Orðaforði
          </h3>
          <div
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2"
            style={{ borderColor: category.color, aspectRatio: '210/297' }}
          >
            {/* Header */}
            <div className="px-6 py-4 text-white" style={{ backgroundColor: category.color }}>
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

            {/* Sub-categories grid */}
            <div
              className="p-4 space-y-3 overflow-y-auto"
              style={{ maxHeight: 'calc(100% - 80px)' }}
            >
              {category.subCategories.map((sub, index) => (
                <div key={index} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div
                    className="px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: category.color + 'CC' }}
                  >
                    {sub.name}
                  </div>
                  <div className="px-3 py-2 flex flex-wrap gap-1.5">
                    {sub.options.map((option, optIndex) => (
                      <span
                        key={optIndex}
                        className="inline-block px-2 py-0.5 rounded-md text-xs font-medium border"
                        style={{
                          borderColor: category.color + '40',
                          color: category.color,
                          backgroundColor: category.color + '08',
                        }}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back side */}
      {(view === 'back' || view === 'both') && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Bakhlið — Setningarammar
          </h3>
          <div
            data-testid="spjald-bakhlid"
            className="bg-white rounded-2xl shadow-lg overflow-hidden border-2"
            style={{ borderColor: category.color, aspectRatio: '210/297' }}
          >
            {/* Header */}
            <div className="px-6 py-4 text-white" style={{ backgroundColor: category.color }}>
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

            {/* Sentence frames */}
            <div
              className="p-6 flex flex-col justify-center"
              style={{ minHeight: 'calc(100% - 80px)' }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Setningarammar</h3>
              {sentenceFrame && (
                <div className="space-y-4">
                  {sentenceFrame.frames.map((frame, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border-2 border-dashed text-center"
                      style={{ borderColor: category.color + '60' }}
                    >
                      <p className="text-lg font-semibold" style={{ color: category.color }}>
                        {frame}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Example section */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Dæmi
                </h4>
                <p className="text-gray-700 italic">{example}</p>
              </div>
            </div>
          </div>

          {/* For the teacher, outside the card: the printed PDF does not carry it, since
              students handle the card. */}
          {teacherNote && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <span className="font-bold">Fyrir kennara</span> (prentast ekki á spjaldið):{' '}
                {teacherNote}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
