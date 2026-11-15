interface FormulaCardProps {
  themeColor: string;
}

export function FormulaCard({ themeColor }: FormulaCardProps) {
  return (
    <div className="formula-card" role="complementary" aria-label="Formúlukort">
      <h3 className="font-bold mb-2 text-lg" style={{ color: themeColor }}>
        📐 Einingagreining — umreikningsstuðlar
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
          <strong>Þynning (varðveisla móla):</strong>
          <div className="font-mono ml-2">mól fyrir = mól eftir</div>
          <div className="font-mono ml-2">(M₁ × V₁) = (M₂ × V₂)</div>
        </div>
        <hr className="my-2" />
        {/* The book's ch03/m68704 and, for mole fraction, ch11/m68783. */}
        <div>
          <strong>Aðrar styrkeiningar:</strong>
          <div className="font-mono ml-2">massaprósenta = (g efnis / g lausnar) × 100 %</div>
          <div className="font-mono ml-2">ppm = (g efnis / g lausnar) × 10⁶</div>
          <div className="font-mono ml-2">ppb = (g efnis / g lausnar) × 10⁹</div>
          <div className="font-mono ml-2">mólhlutfall = mól efnis / mól allra efna</div>
          <div className="ml-2 text-warm-600">Massi lausnar = massi efnis + massi leysis</div>
        </div>
        <hr className="my-2" />
        <div>
          <strong>Umreikningsstuðlar:</strong>
          <div className="font-mono ml-2">1 L = 1000 mL &nbsp;|&nbsp; 1 g = 1000 mg</div>
          <div className="font-mono ml-2">1 mg = 1000 µg</div>
        </div>
      </div>
    </div>
  );
}
