interface MoleculeProps {
  formula: string;
  color: string;
  size?: number;
  className?: string;
}

export function Molecule({ formula, color, size = 50, className = '' }: MoleculeProps) {
  return (
    <div
      className={`molecule flex items-center justify-center rounded-full font-bold text-white shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size > 40 ? '0.75rem' : '0.625rem'
      }}
    >
      {formula}
    </div>
  );
}
