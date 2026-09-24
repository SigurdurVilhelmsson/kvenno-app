interface MoleculeProps {
  formula: string;
  color: string;
  size?: number;
  className?: string;
}

export function Molecule({ formula, color, size = 50, className = '' }: MoleculeProps) {
  // The small balls' 10 px label grows to 12 px on touch screens, where it is read at arm's length.
  const labelSize = size > 40 ? 'text-[0.75rem]' : 'text-[0.625rem] pointer-coarse:text-[0.75rem]';
  return (
    <div
      className={`molecule flex items-center justify-center rounded-full font-bold text-white shadow-lg ${labelSize} ${className}`}
      role="img"
      aria-label={`${formula} sameind`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    >
      {formula}
    </div>
  );
}
