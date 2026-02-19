import { useState, useEffect, useRef } from 'react';

/**
 * ElectrochemicalCell
 *
 * Interactive visualization of a galvanic (voltaic) cell showing:
 * - Two half-cells with electrodes
 * - Electron flow from anode to cathode
 * - Ion migration in solution
 * - Salt bridge
 * - Cell potential (E°cell)
 */

interface HalfCell {
  metal: string;
  metalSymbol: string;
  ion: string;
  ionCharge: string;
  standardPotential: number; // E° in volts
  solutionColor: string;
  metalColor: string;
}

interface CellPair {
  id: string;
  name: string;
  anode: HalfCell;
  cathode: HalfCell;
  description: string;
}

// Standard electrode potentials (E° vs SHE)
const CELL_PAIRS: CellPair[] = [
  {
    id: 'zn-cu',
    name: 'Daniell Cell (Zn-Cu)',
    anode: {
      metal: 'Sink',
      metalSymbol: 'Zn',
      ion: 'Zn²⁺',
      ionCharge: '2+',
      standardPotential: -0.76,
      solutionColor: '#e0f7fa',
      metalColor: '#9e9e9e',
    },
    cathode: {
      metal: 'Kopar',
      metalSymbol: 'Cu',
      ion: 'Cu²⁺',
      ionCharge: '2+',
      standardPotential: 0.34,
      solutionColor: '#bbdefb',
      metalColor: '#f57c00',
    },
    description: 'Klassískt dæmi um galvaníska klefi. Zn oxast (tapar e⁻), Cu²⁺ afoxast (öðlast e⁻).',
  },
  {
    id: 'mg-cu',
    name: 'Mg-Cu Cell',
    anode: {
      metal: 'Magnesíum',
      metalSymbol: 'Mg',
      ion: 'Mg²⁺',
      ionCharge: '2+',
      standardPotential: -2.37,
      solutionColor: '#f3e5f5',
      metalColor: '#bdbdbd',
    },
    cathode: {
      metal: 'Kopar',
      metalSymbol: 'Cu',
      ion: 'Cu²⁺',
      ionCharge: '2+',
      standardPotential: 0.34,
      solutionColor: '#bbdefb',
      metalColor: '#f57c00',
    },
    description: 'Mg er mjög hvarfgjarnt og gefur háa spennu. Notað í rafhlöður.',
  },
  {
    id: 'fe-cu',
    name: 'Fe-Cu Cell',
    anode: {
      metal: 'Járn',
      metalSymbol: 'Fe',
      ion: 'Fe²⁺',
      ionCharge: '2+',
      standardPotential: -0.44,
      solutionColor: '#fff8e1',
      metalColor: '#5d4037',
    },
    cathode: {
      metal: 'Kopar',
      metalSymbol: 'Cu',
      ion: 'Cu²⁺',
      ionCharge: '2+',
      standardPotential: 0.34,
      solutionColor: '#bbdefb',
      metalColor: '#f57c00',
    },
    description: 'Járn oxast frekar en kopar. Þetta útskýrir af hverju járn ryðgar.',
  },
  {
    id: 'zn-ag',
    name: 'Zn-Ag Cell',
    anode: {
      metal: 'Sink',
      metalSymbol: 'Zn',
      ion: 'Zn²⁺',
      ionCharge: '2+',
      standardPotential: -0.76,
      solutionColor: '#e0f7fa',
      metalColor: '#9e9e9e',
    },
    cathode: {
      metal: 'Silfur',
      metalSymbol: 'Ag',
      ion: 'Ag⁺',
      ionCharge: '+',
      standardPotential: 0.80,
      solutionColor: '#eceff1',
      metalColor: '#cfd8dc',
    },
    description: 'Silfur hefur háa afoxunargetu. Notað í klukkurafhlöður.',
  },
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'electron' | 'cation' | 'anion';
  side: 'anode' | 'cathode' | 'bridge';
}

interface ElectrochemicalCellProps {
  compact?: boolean;
  interactive?: boolean;
  initialPair?: string;
}

export function ElectrochemicalCell({
  compact = false,
  interactive = true,
  initialPair = 'zn-cu',
}: ElectrochemicalCellProps) {
  const [selectedPair, setSelectedPair] = useState(initialPair);
  const [isRunning, setIsRunning] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const animationRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);

  const pair = CELL_PAIRS.find(p => p.id === selectedPair) || CELL_PAIRS[0];
  const cellPotential = pair.cathode.standardPotential - pair.anode.standardPotential;

  // Initialize particles
  useEffect(() => {
    if (isRunning) {
      // Spawn initial particles
      const initialParticles: Particle[] = [];

      // Add some electrons at anode
      for (let i = 0; i < 3; i++) {
        initialParticles.push({
          id: particleIdRef.current++,
          x: 80 + Math.random() * 30,
          y: 100 + Math.random() * 40,
          vx: 0.5 + Math.random() * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          type: 'electron',
          side: 'anode',
        });
      }

      // Add cations in solutions
      for (let i = 0; i < 4; i++) {
        initialParticles.push({
          id: particleIdRef.current++,
          x: 40 + Math.random() * 80,
          y: 140 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          type: 'cation',
          side: 'anode',
        });
        initialParticles.push({
          id: particleIdRef.current++,
          x: 280 + Math.random() * 80,
          y: 140 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          type: 'cation',
          side: 'cathode',
        });
      }

      setParticles(initialParticles);
    } else {
      setParticles([]);
    }
  }, [isRunning, selectedPair]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(p => {
          let newX = p.x + p.vx;
          let newY = p.y + p.vy;
          let newVx = p.vx;
          let newVy = p.vy;
          let newSide = p.side;

          if (p.type === 'electron') {
            // Electrons flow from anode to cathode through wire
            if (p.side === 'anode') {
              // Move toward wire (top)
              if (newY > 60) {
                newVy = -0.5;
              }
              // Move right through wire
              if (newY <= 65 && newX < 200) {
                newVy = 0;
                newVx = 1.5;
              }
              // Transition to cathode side
              if (newX >= 200) {
                newSide = 'cathode';
              }
            } else {
              // Move down into cathode
              if (newY < 120) {
                newVx = 0;
                newVy = 0.5;
              } else {
                // Reached cathode, remove particle
                return null;
              }
            }
          } else if (p.type === 'cation') {
            // Random motion with slight drift
            newVx += (Math.random() - 0.5) * 0.1;
            newVy += (Math.random() - 0.5) * 0.1;
            newVx *= 0.98;
            newVy *= 0.98;

            // Boundary constraints
            if (p.side === 'anode') {
              if (newX < 30) { newX = 30; newVx *= -1; }
              if (newX > 150) { newX = 150; newVx *= -1; }
            } else {
              if (newX < 250) { newX = 250; newVx *= -1; }
              if (newX > 370) { newX = 370; newVx *= -1; }
            }
            if (newY < 130) { newY = 130; newVy *= -1; }
            if (newY > 210) { newY = 210; newVy *= -1; }
          }

          return {
            ...p,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            side: newSide,
          };
        }).filter(Boolean) as Particle[];

        // Spawn new electrons periodically
        if (Math.random() < 0.05 && updated.filter(p => p.type === 'electron').length < 8) {
          updated.push({
            id: particleIdRef.current++,
            x: 80 + Math.random() * 20,
            y: 110 + Math.random() * 20,
            vx: 0.3,
            vy: -0.3,
            type: 'electron',
            side: 'anode',
          });
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  const width = compact ? 320 : 400;
  const height = compact ? 200 : 250;

  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-amber-800 ${compact ? 'text-sm' : 'text-base'}`}>
          Galvanísk klefi
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={e => setShowLabels(e.target.checked)}
              className="rounded border-gray-300"
            />
            Merki
          </label>
        </div>
      </div>

      {/* Cell selector */}
      {interactive && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {CELL_PAIRS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPair(p.id);
                setIsRunning(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedPair === p.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-amber-100'
              }`}
            >
              {p.anode.metalSymbol}-{p.cathode.metalSymbol}
            </button>
          ))}
        </div>
      )}

      {/* SVG Cell Diagram */}
      <div className="flex justify-center mb-4">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="bg-slate-100 rounded-xl border border-slate-200"
        >
          <defs>
            {/* Gradients for electrodes */}
            <linearGradient id="anodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={pair.anode.metalColor} />
              <stop offset="100%" stopColor="#616161" />
            </linearGradient>
            <linearGradient id="cathodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={pair.cathode.metalColor} />
              <stop offset="100%" stopColor="#795548" />
            </linearGradient>
          </defs>

          {/* Wire connecting electrodes */}
          <path
            d="M 90 70 L 90 40 L 310 40 L 310 70"
            fill="none"
            stroke="#424242"
            strokeWidth="3"
          />

          {/* Voltmeter */}
          <circle cx="200" cy="40" r="20" fill="white" stroke="#424242" strokeWidth="2" />
          <text x="200" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#424242">
            {cellPotential.toFixed(2)}V
          </text>

          {/* Anode beaker */}
          <rect x="30" y="80" width="120" height="150" rx="5" fill="white" stroke="#9e9e9e" strokeWidth="2" />
          <rect x="35" y="120" width="110" height="105" fill={pair.anode.solutionColor} />

          {/* Cathode beaker */}
          <rect x="250" y="80" width="120" height="150" rx="5" fill="white" stroke="#9e9e9e" strokeWidth="2" />
          <rect x="255" y="120" width="110" height="105" fill={pair.cathode.solutionColor} />

          {/* Salt bridge */}
          <path
            d="M 145 140 Q 200 100 255 140"
            fill="none"
            stroke="#78909c"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 145 140 Q 200 100 255 140"
            fill="none"
            stroke="#b0bec5"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Anode electrode */}
          <rect x="80" y="60" width="20" height="140" fill="url(#anodeGrad)" rx="2" />

          {/* Cathode electrode */}
          <rect x="300" y="60" width="20" height="140" fill="url(#cathodeGrad)" rx="2" />

          {/* Animated particles */}
          {particles.map(p => (
            <g key={p.id}>
              {p.type === 'electron' && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffc107"
                  className="animate-pulse"
                />
              )}
              {p.type === 'cation' && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill={p.side === 'anode' ? '#90caf9' : '#ffab91'}
                  stroke="#424242"
                  strokeWidth="1"
                />
              )}
            </g>
          ))}

          {/* Labels */}
          {showLabels && (
            <>
              {/* Anode label */}
              <text x="90" y="245" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#d32f2f">
                Anóða (-)
              </text>
              <text x="90" y={compact ? 258 : 260} textAnchor="middle" fontSize="10" fill="#616161">
                {pair.anode.metalSymbol} → {pair.anode.ion} + e⁻
              </text>

              {/* Cathode label */}
              <text x="310" y="245" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1976d2">
                Kaþóða (+)
              </text>
              <text x="310" y={compact ? 258 : 260} textAnchor="middle" fontSize="10" fill="#616161">
                {pair.cathode.ion} + e⁻ → {pair.cathode.metalSymbol}
              </text>

              {/* Salt bridge label */}
              <text x="200" y="95" textAnchor="middle" fontSize="10" fill="#546e7a">
                Saltbrú
              </text>

              {/* Electrode symbols */}
              <text x="90" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
                {pair.anode.metalSymbol}
              </text>
              <text x="310" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
                {pair.cathode.metalSymbol}
              </text>

              {/* Electron flow arrow */}
              <path
                d="M 130 40 L 170 40"
                fill="none"
                stroke="#ffc107"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ffc107" />
                </marker>
              </defs>
              <text x="150" y="32" textAnchor="middle" fontSize="9" fill="#ffc107">
                e⁻
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? '⏹ Stöðva' : '▶ Keyra'}
        </button>
      </div>

      {/* Cell info */}
      <div className="bg-white rounded-lg p-3 border border-amber-200">
        <div className="text-center mb-2">
          <span className="font-bold text-amber-700">{pair.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <div className="bg-red-50 p-2 rounded border border-red-200">
            <div className="font-medium text-red-700">Anóða (oxun)</div>
            <div className="text-xs text-red-600">
              {pair.anode.metalSymbol} → {pair.anode.ion} + 2e⁻
            </div>
            <div className="text-xs text-gray-500">E° = {pair.anode.standardPotential.toFixed(2)} V</div>
          </div>
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <div className="font-medium text-blue-700">Kaþóða (afoxun)</div>
            <div className="text-xs text-blue-600">
              {pair.cathode.ion} + 2e⁻ → {pair.cathode.metalSymbol}
            </div>
            <div className="text-xs text-gray-500">E° = {pair.cathode.standardPotential.toFixed(2)} V</div>
          </div>
        </div>

        <div className="text-center p-2 bg-amber-100 rounded-lg">
          <div className="text-sm text-amber-700">
            <strong>E°<sub>cell</sub></strong> = E°<sub>kaþóða</sub> - E°<sub>anóða</sub> = {pair.cathode.standardPotential.toFixed(2)} - ({pair.anode.standardPotential.toFixed(2)}) = <strong>{cellPotential.toFixed(2)} V</strong>
          </div>
        </div>

        <p className={`mt-2 text-center ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
          {pair.description}
        </p>
      </div>

      {/* Educational note */}
      <div className={`mt-3 text-center ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
        <p>
          <strong>Galvanísk klefi</strong> breytir efnaorku í raforku. Rafeindir flæða frá anóðu til kaþóðu.
        </p>
      </div>
    </div>
  );
}

export default ElectrochemicalCell;
