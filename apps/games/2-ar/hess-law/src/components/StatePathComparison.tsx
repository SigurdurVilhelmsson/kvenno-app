import { useState, useMemo, useRef } from 'react';

import { useContainerWidth } from '@shared/components/ResponsiveContainer';
import { formatDecimal } from '@shared/utils';

interface PathStep {
  label: string;
  deltaH: number;
}

interface ReactionPath {
  id: string;
  name: string;
  color: string;
  steps: PathStep[];
  description: string;
}

interface PathExample {
  id: string;
  title: string;
  reactants: string;
  products: string;
  totalDeltaH: number;
  paths: ReactionPath[];
  explanation: string;
}

const EXAMPLES: PathExample[] = [
  {
    id: 'carbon-dioxide',
    title: 'Myndun CO₂',
    reactants: 'C(s) + O₂(g)',
    products: 'CO₂(g)',
    totalDeltaH: -393.5,
    paths: [
      {
        id: 'direct',
        name: 'Bein leið',
        color: '#22c55e',
        steps: [{ label: 'C + O₂ → CO₂', deltaH: -393.5 }],
        description: 'Fullkominn bruni kolefnis í einu skrefi',
      },
      {
        id: 'via-co',
        name: 'Gegnum CO',
        color: '#3b82f6',
        steps: [
          { label: 'C + ½O₂ → CO', deltaH: -110.5 },
          { label: 'CO + ½O₂ → CO₂', deltaH: -283.0 },
        ],
        description: 'Fyrst ófullkominn bruni (CO), síðan áframhaldandi bruni',
      },
    ],
    explanation:
      'Hvort sem kolefni brennur beint í CO₂ eða fyrst í CO og síðan í CO₂, er heildarorkubreytingin sú sama: -393,5 kJ',
  },
  {
    id: 'water-formation',
    title: 'Myndun H₂O',
    reactants: 'H₂(g) + ½O₂(g)',
    products: 'H₂O(l)',
    totalDeltaH: -285.8,
    paths: [
      {
        id: 'direct',
        name: 'Bein leið',
        color: '#22c55e',
        steps: [{ label: 'H₂ + ½O₂ → H₂O(l)', deltaH: -285.8 }],
        description: 'Bein myndun fljótandi vatns',
      },
      {
        id: 'via-gas',
        name: 'Gegnum H₂O(g)',
        color: '#f59e0b',
        steps: [
          { label: 'H₂ + ½O₂ → H₂O(g)', deltaH: -241.8 },
          { label: 'H₂O(g) → H₂O(l)', deltaH: -44.0 },
        ],
        description: 'Fyrst myndast vatnsgufa, síðan þéttist hún í vökva',
      },
    ],
    explanation:
      'Vatn getur myndast beint sem vökvi eða fyrst sem gufa sem síðan þéttist. Heildarorkan er alltaf -285,8 kJ',
  },
  {
    id: 'ammonia',
    title: 'Myndun NH₃',
    reactants: '½N₂(g) + 3/2H₂(g)',
    products: 'NH₃(g)',
    totalDeltaH: -46.1,
    paths: [
      {
        id: 'direct',
        name: 'Haber-ferlið',
        color: '#22c55e',
        steps: [{ label: '½N₂ + 3/2H₂ → NH₃', deltaH: -46.1 }],
        description: 'Bein samsetning í Haber-ferlinu',
      },
      {
        id: 'via-atoms',
        name: 'Gegnum atóm',
        color: '#ef4444',
        steps: [
          { label: '½N₂ → N', deltaH: 472.7 },
          { label: '3/2H₂ → 3H', deltaH: 654.8 },
          { label: 'N + 3H → NH₃', deltaH: -1173.6 },
        ],
        description: 'Sundrun í atóm, síðan samsetning - þetta er óraunhæft en sýnir sömu orku',
      },
    ],
    explanation:
      'Þótt atómaleiðin sé ekki framkvæmanleg í raun, sýnir hún að orkubreytingin er ástand-háð, ekki leið-háð',
  },
];

interface StatePathComparisonProps {
  exampleId?: string;
  compact?: boolean;
}

export function StatePathComparison({ exampleId, compact = false }: StatePathComparisonProps) {
  const [selectedExample, setSelectedExample] = useState(
    EXAMPLES.find((e) => e.id === exampleId) || EXAMPLES[0]
  );
  const [visiblePaths, setVisiblePaths] = useState<string[]>(
    selectedExample.paths.map((p) => p.id)
  );
  const [animating, setAnimating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // The drawing is laid out 450 units wide. Where its box is narrower (a phone, about 260 px),
  // it is laid out at the box's own width instead of being scaled down, so its labels keep a
  // readable size rather than shrinking to 5 px; the desktop drawing is unchanged.
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(svgWrapRef);
  const preferredWidth = 450;
  const narrow = containerWidth !== null && containerWidth < preferredWidth;
  const width = narrow ? Math.max(220, Math.floor(containerWidth)) : preferredWidth;
  const height = narrow ? (compact ? 240 : 280) : compact ? 200 : 280;
  // Narrow layout: tighter side margins, larger type, and the second path's step values
  // below its points so they cannot collide with the first path's, which sit above.
  const startX = narrow ? 44 : 60;
  const endX = narrow ? width - 28 : width - 60;
  const lineStartX = narrow ? 34 : 40;
  const lineEndX = narrow ? width - 8 : width - 20;
  const stepFont = narrow ? 12 : 9;
  const smallFont = narrow ? 12 : 10;
  const labelFont = narrow ? 13 : 11;
  // At phone size the labels sit closer to the other path's line; a dark outline in the
  // box's own colour keeps them readable where a line runs through them.
  const halo = narrow
    ? { stroke: '#1c1813', strokeWidth: 4, strokeLinejoin: 'round' as const, paintOrder: 'stroke' }
    : {};

  // Calculate energy scale
  const allEnergies = useMemo(() => {
    const energies: number[] = [0];
    selectedExample.paths.forEach((path) => {
      let cumulative = 0;
      path.steps.forEach((step) => {
        cumulative += step.deltaH;
        energies.push(cumulative);
      });
    });
    return energies;
  }, [selectedExample]);

  const minEnergy = Math.min(...allEnergies) - 50;
  const maxEnergy = Math.max(...allEnergies) + 50;
  const range = maxEnergy - minEnergy;

  const energyToY = (energy: number): number => {
    const normalized = (maxEnergy - energy) / range;
    return 40 + normalized * (height - 80);
  };

  // Generate path data for each reaction path
  const pathsData = useMemo(() => {
    return selectedExample.paths.map((path, pathIndex) => {
      const totalSteps = path.steps.length;
      const stepWidth = (endX - startX) / (totalSteps + 0.5);

      let cumulative = 0;
      const points: { x: number; y: number; label: string; deltaH: number; cumulative: number }[] =
        [];

      // Start point
      points.push({ x: startX, y: energyToY(0), label: 'Start', deltaH: 0, cumulative: 0 });

      // Each step
      path.steps.forEach((step, i) => {
        cumulative += step.deltaH;
        const x = startX + (i + 1) * stepWidth;
        points.push({
          x,
          y: energyToY(cumulative),
          label: step.label,
          deltaH: step.deltaH,
          cumulative,
        });
      });

      // Generate SVG path with curves
      let d = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const midX = (prev.x + curr.x) / 2;

        // Curved path: horizontal, then curve down/up
        if (showOverlay) {
          // Offset paths slightly when overlaid
          const offset = (pathIndex - (selectedExample.paths.length - 1) / 2) * 3;
          d += ` L ${midX} ${prev.y + offset}`;
          d += ` Q ${midX} ${curr.y + offset} ${curr.x} ${curr.y + offset}`;
        } else {
          d += ` L ${midX} ${prev.y}`;
          d += ` Q ${midX} ${curr.y} ${curr.x} ${curr.y}`;
        }
      }

      return { path, points, d };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: energyToY is derived from existing deps
  }, [selectedExample, width, height, showOverlay, startX, endX]);

  // A step's ΔH value. Wide: above its point. Narrow: the second path's go below its points,
  // so the two paths' values cannot land on each other.
  const stepLabel = (
    path: ReactionPath,
    pathIndex: number,
    point: { x: number; y: number; deltaH: number }
  ) => (
    <text
      x={point.x}
      y={narrow && pathIndex > 0 ? point.y + 22 : point.y - 12}
      fill={path.color}
      fontSize={stepFont}
      textAnchor="middle"
      fontWeight="bold"
      {...halo}
    >
      {point.deltaH > 0 ? '+' : ''}
      {point.deltaH.toFixed(0)}
    </text>
  );

  const handleExampleChange = (example: PathExample) => {
    setSelectedExample(example);
    setVisiblePaths(example.paths.map((p) => p.id));
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1000);
  };

  const togglePath = (pathId: string) => {
    setVisiblePaths((prev) =>
      prev.includes(pathId) ? prev.filter((p) => p !== pathId) : [...prev, pathId]
    );
  };

  return (
    <div
      className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3
          className={`font-bold text-indigo-800 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}
        >
          <span>🔀</span> Ástandsfall: Mismunandi leiðir
        </h3>
        {/* One switch, label included, so the whole row is the touch target and the switch
            has an accessible name. */}
        <button
          type="button"
          role="switch"
          aria-checked={showOverlay}
          onClick={() => setShowOverlay(!showOverlay)}
          className="flex shrink-0 items-center gap-2 pointer-coarse:min-h-11"
        >
          <span className="text-xs text-warm-600">Sýna saman:</span>
          <span
            className={`flex w-10 h-5 shrink-0 items-center rounded-full transition-colors ${showOverlay ? 'bg-indigo-500' : 'bg-warm-300'}`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white transform transition-transform ${showOverlay ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </span>
        </button>
      </div>

      {/* Example selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            onClick={() => handleExampleChange(example)}
            className={`px-3 py-1.5 pointer-coarse:min-h-11 rounded-lg text-sm font-medium transition-all ${
              selectedExample.id === example.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-warm-700 hover:bg-indigo-100 border border-warm-200'
            }`}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* Reaction display */}
      <div className="bg-white rounded-lg p-3 mb-4 text-center">
        <div className="font-mono text-lg">
          <span className="text-blue-700">{selectedExample.reactants}</span>
          <span className="mx-2">→</span>
          <span className="text-green-700">{selectedExample.products}</span>
        </div>
        <div className="text-lg font-bold text-indigo-600 mt-1">
          ΔH = {formatDecimal(selectedExample.totalDeltaH)} kJ
        </div>
      </div>

      {/* Path toggles */}
      <div className="flex flex-wrap gap-3 mb-4">
        {selectedExample.paths.map((path) => (
          <button
            key={path.id}
            onClick={() => togglePath(path.id)}
            className={`flex items-center gap-2 px-3 py-2 pointer-coarse:min-h-11 rounded-lg text-sm font-medium transition-all border-2 ${
              visiblePaths.includes(path.id) ? 'bg-white shadow-xs' : 'bg-warm-100 opacity-50'
            }`}
            style={{
              borderColor: visiblePaths.includes(path.id) ? path.color : '#d1d5db',
            }}
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: path.color }} />
            <span>{path.name}</span>
            <span className="text-warm-500">({path.steps.length} skref)</span>
          </button>
        ))}
      </div>

      {/* SVG Diagram */}
      <div className="bg-warm-900 rounded-xl p-3 sm:p-4 mb-4">
        <div ref={svgWrapRef}>
          <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
            role="img"
            aria-label="Samanburður á orkuleiðum: bein leið og óbein leið gefa sömu orkubreytingu"
          >
            <title>Samanburður orkuleiða (lögmál Hess)</title>
            {/* Grid */}
            <defs>
              <pattern id="state-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width={width} height={height} fill="url(#state-grid)" />

            {/* Zero line */}
            <line
              x1={lineStartX}
              y1={energyToY(0)}
              x2={lineEndX}
              y2={energyToY(0)}
              stroke="#6b7280"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={narrow ? lineStartX - 4 : 20}
              y={energyToY(0) + 4}
              fill="#9ca3af"
              fontSize={smallFont}
              textAnchor={narrow ? 'end' : 'middle'}
            >
              0
            </text>

            {/* Target line (final energy) */}
            <line
              x1={lineStartX}
              y1={energyToY(selectedExample.totalDeltaH)}
              x2={lineEndX}
              y2={energyToY(selectedExample.totalDeltaH)}
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="8,4"
            />
            <text
              x={narrow ? lineEndX : width - 15}
              y={energyToY(selectedExample.totalDeltaH) + (narrow ? -6 : 4)}
              fill="#a855f7"
              fontSize={smallFont}
              fontWeight="bold"
              textAnchor={narrow ? 'end' : 'start'}
              {...halo}
            >
              {formatDecimal(selectedExample.totalDeltaH)}
            </text>

            {/* Draw each path */}
            {pathsData.map(({ path, points, d }, pathIndex) => {
              if (!visiblePaths.includes(path.id)) return null;

              return (
                <g key={path.id}>
                  {/* Path line */}
                  <path
                    d={d}
                    fill="none"
                    stroke={path.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={animating ? 0 : 0.9}
                    className={animating ? '' : 'transition-opacity duration-500'}
                    style={
                      animating
                        ? {
                            strokeDasharray: '1000',
                            strokeDashoffset: '1000',
                            animation: 'drawStatePath 1s ease-out forwards',
                          }
                        : {}
                    }
                  />

                  {/* Step markers */}
                  {points.map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={i === 0 ? 8 : i === points.length - 1 ? 10 : 6}
                        fill={path.color}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      {!narrow && i > 0 && i < points.length && stepLabel(path, pathIndex, point)}
                    </g>
                  ))}
                </g>
              );
            })}

            {/* Narrow layout: step values drawn after every path, so no line covers them */}
            {narrow &&
              pathsData.map(
                ({ path, points }, pathIndex) =>
                  visiblePaths.includes(path.id) && (
                    <g key={path.id}>
                      {points.map(
                        (point, i) => i > 0 && <g key={i}>{stepLabel(path, pathIndex, point)}</g>
                      )}
                    </g>
                  )
              )}

            {/* Start label */}
            <text
              x={startX}
              y={energyToY(0) - 20}
              fill="#22c55e"
              fontSize={labelFont}
              textAnchor="middle"
              fontWeight="bold"
              {...halo}
            >
              Byrjun
            </text>

            {/* End label */}
            <text
              x={narrow ? width - 70 : width - 60}
              y={energyToY(selectedExample.totalDeltaH) + (narrow ? 40 : 25)}
              fill="#a855f7"
              fontSize={labelFont}
              textAnchor="middle"
              fontWeight="bold"
              {...halo}
            >
              Endir: sama orka!
            </text>

            {/* Y-axis label */}
            <text
              x={narrow ? 10 : 12}
              y={height / 2}
              fill="#9ca3af"
              fontSize={smallFont}
              textAnchor="middle"
              transform={`rotate(-90, ${narrow ? 10 : 12}, ${height / 2})`}
            >
              Vermi (kJ)
            </text>
          </svg>
        </div>

        <style>{`
          @keyframes drawStatePath {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </div>

      {/* Path descriptions */}
      <div className="space-y-2 mb-4">
        {selectedExample.paths.map(
          (path) =>
            visiblePaths.includes(path.id) && (
              <div
                key={path.id}
                className="flex items-start gap-2 text-sm p-2 rounded-lg"
                style={{ backgroundColor: `${path.color}15` }}
              >
                <div
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: path.color }}
                />
                <div>
                  <span className="font-medium" style={{ color: path.color }}>
                    {path.name}:
                  </span>
                  <span className="text-warm-700 ml-1">{path.description}</span>
                </div>
              </div>
            )
        )}
      </div>

      {/* Key insight */}
      <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-3">
        <div className="font-bold text-indigo-800 text-sm mb-1">💡 Lykilatriði:</div>
        <p className="text-indigo-900 text-sm">{selectedExample.explanation}</p>
      </div>

      {/* State function reminder */}
      <div className="mt-4 text-center text-xs text-warm-500">
        Vermi (H) er <strong>ástandsfall</strong> — gildi þess fer aðeins eftir upphafs- og
        lokaástandi, ekki leiðinni þar á milli.
      </div>
    </div>
  );
}
