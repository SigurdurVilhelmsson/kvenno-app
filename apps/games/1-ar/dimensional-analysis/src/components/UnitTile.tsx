interface UnitTileProps {
  unit: string;
  position: 'numerator' | 'denominator';
  cancelling?: boolean;
}

export function UnitTile({ unit, position, cancelling }: UnitTileProps) {
  return (
    <div
      className={`unit-tile inline-block px-4 py-2 m-1 rounded-lg font-semibold text-white shadow-lg transition-all ${
        position === 'numerator' ? 'bg-blue-500' : 'bg-green-500'
      } ${cancelling ? 'opacity-50 line-through' : ''}`}
    >
      {unit}
    </div>
  );
}
