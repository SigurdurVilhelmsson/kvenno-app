import { Hlusta } from './Hlusta';
import { Sheet } from './Sheet';
import { Category, Level } from '../data/types';

interface SpjaldPreviewProps {
  category: Category;
  level: Level;
  view: 'ordafordi' | 'setningarammar';
}

/** Pages 1 and 2 of the printed card, laid out as the PDF lays them out. */
export function SpjaldPreview({ category, level, view }: SpjaldPreviewProps) {
  if (view === 'ordafordi') {
    return (
      <Sheet category={category} level={level} page="Orðaforði" testId="spjald-ordafordi">
        <div className="space-y-2.5">
          {category.subCategories.map((sub, index) => (
            <div key={index} className="rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: category.color }}
              >
                {sub.name}
              </div>
              <div className="px-3 py-2 flex flex-wrap gap-1.5">
                {sub.options.map((option, optIndex) => (
                  <span
                    key={optIndex}
                    className="inline-block px-2 py-0.5 rounded-md text-sm font-medium border"
                    style={{
                      borderColor: category.color + '40',
                      color: category.color,
                      backgroundColor: category.color + '08',
                    }}
                  >
                    {option}
                    <Hlusta text={option} color={category.color} />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    );
  }

  const sentenceFrame = category.sentenceFrames.find((sf) => sf.level === level);
  const example = category.examples.find((e) => e.level === level)?.text;
  const teacherNote = category.teacherNotes.find((n) => n.level === level)?.text;

  return (
    <div>
      <Sheet category={category} level={level} page="Setningarammar" testId="spjald-bakhlid">
        <div className="px-2 py-2">
          <p className="text-lg font-bold text-gray-800 mb-5 text-center">Setningarammar</p>
          {sentenceFrame && (
            <div className="space-y-3">
              {sentenceFrame.frames.map((frame, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border-2 border-dashed text-center"
                  style={{ borderColor: category.color + '60' }}
                >
                  <p className="text-lg font-semibold" style={{ color: category.color }}>
                    {frame} <Hlusta text={frame} color={category.color} />
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Dæmi</p>
            <p className="text-gray-700">
              {example} {example && <Hlusta text={example} color={category.color} />}
            </p>
          </div>
        </div>
      </Sheet>

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
  );
}
