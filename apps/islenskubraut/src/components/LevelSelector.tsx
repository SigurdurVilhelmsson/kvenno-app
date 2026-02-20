import { Level } from '../data/types';

interface LevelSelectorProps {
  selected: Level;
  onChange: (level: Level) => void;
  color: string;
}

const levels: { value: Level; label: string; description: string }[] = [
  { value: 'A1', label: 'A1', description: 'Byrjandi' },
  { value: 'A2', label: 'A2', description: 'Grunnþekking' },
  { value: 'B1', label: 'B1', description: 'Miðstig' },
];

export function LevelSelector({
  selected,
  onChange,
  color,
}: LevelSelectorProps) {
  return (
    <div className="flex gap-3">
      {levels.map((level) => {
        const isSelected = selected === level.value;
        return (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`
              flex-1 sm:flex-none px-5 py-3 rounded-xl font-semibold text-center transition-all duration-200
              ${
                isSelected
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }
            `}
            style={isSelected ? { backgroundColor: color } : undefined}
          >
            <div className="text-lg">{level.label}</div>
            <div
              className={`text-xs mt-0.5 ${
                isSelected ? 'text-white/80' : 'text-slate-400'
              }`}
            >
              {level.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
