interface BeakerProps {
  volume: number;
  maxVolume?: number;
  concentration?: number;
  color?: string;
  label?: string;
  animate?: boolean;
  animationType?: 'fill' | 'pour' | 'mix' | 'dissolve';
}

export function Beaker({
  volume,
  maxVolume = 500,
  concentration,
  color = '#3b82f6',
  label,
  animate = false,
  animationType = 'fill'
}: BeakerProps) {
  const height = 200;
  const width = 120;
  const fillHeight = (volume / maxVolume) * 150;

  // Calculate color intensity based on concentration
  const getColorIntensity = (conc?: number) => {
    if (!conc) return color;
    const intensity = Math.min(Math.max(conc / 5, 0.2), 1);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const lightness = 1 - intensity * 0.7;
    return `rgb(${Math.round(r * lightness)}, ${Math.round(g * lightness)}, ${Math.round(b * lightness)})`;
  };

  return (
    <div className="beaker" style={{ textAlign: 'center' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Beaker outline */}
        <path
          d={`M 20 20 L 20 170 L 30 180 L 90 180 L 100 170 L 100 20`}
          fill="none"
          stroke="#4b5563"
          strokeWidth="2"
        />

        {/* Graduation marks */}
        {[100, 200, 300, 400, 500].map((vol) => {
          const y = 180 - (vol / maxVolume) * 150;
          return (
            <g key={vol}>
              <line x1="20" y1={y} x2="15" y2={y} stroke="#6b7280" strokeWidth="1" />
              <text x="10" y={y + 3} fontSize="8" fill="#6b7280" textAnchor="end">
                {vol}
              </text>
            </g>
          );
        })}

        {/* Solution fill */}
        <path
          className={animate ? `${animationType}-animation` : ''}
          d={`M 21 ${180 - fillHeight} L 21 169 L 30 179 L 90 179 L 99 169 L 99 ${180 - fillHeight} Z`}
          fill={getColorIntensity(concentration)}
          opacity="0.8"
        />

        {/* Meniscus (wavy line) */}
        {fillHeight > 0 && (
          <path
            d={`M 21 ${180 - fillHeight} Q 35 ${180 - fillHeight - 2} 60 ${180 - fillHeight} T 99 ${180 - fillHeight}`}
            fill="none"
            stroke={getColorIntensity(concentration)}
            strokeWidth="1.5"
            opacity="0.6"
          />
        )}
      </svg>
      {label && (
        <div className="text-sm mt-2 font-semibold text-gray-700 whitespace-pre-line">
          {label}
        </div>
      )}
    </div>
  );
}
