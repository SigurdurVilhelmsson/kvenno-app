interface FormulaCardProps {
  themeColor: string;
}

export function FormulaCard({ themeColor }: FormulaCardProps) {
  return (
    <div className="formula-card" role="complementary" aria-label="Formúlukort">
      <h3 className="font-bold mb-2 text-lg" style={{ color: themeColor }}>
        📐 Formúlur
      </h3>
      <div className="text-sm space-y-1 font-mono">
        <p>
          <strong>Útþynning:</strong> M₁V₁ = M₂V₂
        </p>
        <p>
          <strong>Mólstyrkur:</strong> M = mol / L
        </p>
        <p>
          <strong>Mól:</strong> mol = massi(g) / mólmassi(g/mol)
        </p>
        <p>
          <strong>Blöndun:</strong> M = (M₁V₁ + M₂V₂) / (V₁ + V₂)
        </p>
        <hr className="my-2" />
        <p>
          <strong>Umreikningar:</strong>
        </p>
        <p>1 L = 1000 mL</p>
        <p>1 g = 1000 mg</p>
      </div>
    </div>
  );
}
