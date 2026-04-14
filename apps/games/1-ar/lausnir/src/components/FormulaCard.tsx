interface FormulaCardProps {
  themeColor: string;
}

export function FormulaCard({ themeColor }: FormulaCardProps) {
  return (
    <div className="formula-card" role="complementary" aria-label="Formúlukort">
      <h3 className="font-bold mb-2 text-lg" style={{ color: themeColor }}>
        📐 Einingagreining — umbreytingarstuðlar
      </h3>
      <div className="text-sm space-y-2">
        <div>
          <strong>Mólstyrkur:</strong>
          <div className="font-mono ml-2">M = mól / L (styrkur = magn / rúmmál)</div>
        </div>
        <div>
          <strong>Mól úr massa:</strong>
          <div className="font-mono ml-2">g × (1 mól / mólmassi g) → mól</div>
        </div>
        <div>
          <strong>Útþynning (varðveisla móla):</strong>
          <div className="font-mono ml-2">mól fyrir = mól eftir</div>
          <div className="font-mono ml-2">(M₁ × V₁) = (M₂ × V₂)</div>
        </div>
        <hr className="my-2" />
        <div>
          <strong>Umbreytingarstuðlar:</strong>
          <div className="font-mono ml-2">1 L = 1000 mL &nbsp;|&nbsp; 1 g = 1000 mg</div>
        </div>
      </div>
    </div>
  );
}
