import { useState, useEffect, useCallback } from 'react';
import { Molecule } from './Molecule';

interface ReactantData {
  formula: string;
  coeff: number;
  color: string;
}

interface ProductData {
  formula: string;
  coeff: number;
  color: string;
}

interface ReactionAnimationProps {
  reactant1: ReactantData;
  reactant2: ReactantData;
  products: ProductData[];
  r1Count: number;
  r2Count: number;
  autoPlay?: boolean;
  showResult?: boolean;
  onAnimationComplete?: () => void;
}

interface AnimatedMolecule {
  id: number;
  formula: string;
  color: string;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  opacity: number;
  scale: number;
  isProduct: boolean;
  reactionIndex: number;
}

export function ReactionAnimation({
  reactant1,
  reactant2,
  products,
  r1Count,
  r2Count,
  autoPlay = false,
  showResult = false,
  onAnimationComplete
}: ReactionAnimationProps) {
  const [animationStep, setAnimationStep] = useState<'initial' | 'combining' | 'reacting' | 'products' | 'complete'>('initial');
  const [molecules, setMolecules] = useState<AnimatedMolecule[]>([]);
  const [currentReaction, setCurrentReaction] = useState(0);

  // Calculate reaction amounts
  const timesR1 = Math.floor(r1Count / reactant1.coeff);
  const timesR2 = Math.floor(r2Count / reactant2.coeff);
  const timesReactionRuns = Math.min(timesR1, timesR2);
  const limitingIsR1 = timesR1 <= timesR2;

  const excessR1 = r1Count - (timesReactionRuns * reactant1.coeff);
  const excessR2 = r2Count - (timesReactionRuns * reactant2.coeff);

  // Initialize molecules
  const initializeMolecules = useCallback(() => {
    const newMolecules: AnimatedMolecule[] = [];
    let id = 0;

    // Reactant 1 molecules (left side)
    for (let i = 0; i < r1Count; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      newMolecules.push({
        id: id++,
        formula: reactant1.formula,
        color: reactant1.color,
        x: 10 + col * 15,
        y: 20 + row * 18,
        opacity: 1,
        scale: 1,
        isProduct: false,
        reactionIndex: Math.floor(i / reactant1.coeff)
      });
    }

    // Reactant 2 molecules (right side)
    for (let i = 0; i < r2Count; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      newMolecules.push({
        id: id++,
        formula: reactant2.formula,
        color: reactant2.color,
        x: 70 + col * 15,
        y: 20 + row * 18,
        opacity: 1,
        scale: 1,
        isProduct: false,
        reactionIndex: Math.floor(i / reactant2.coeff)
      });
    }

    setMolecules(newMolecules);
    setAnimationStep('initial');
    setCurrentReaction(0);
  }, [r1Count, r2Count, reactant1, reactant2]);

  useEffect(() => {
    initializeMolecules();
  }, [initializeMolecules]);

  // Run animation step
  const runReaction = useCallback(() => {
    if (currentReaction >= timesReactionRuns) {
      setAnimationStep('complete');
      onAnimationComplete?.();
      return;
    }

    setAnimationStep('combining');

    // Move reactants to center
    setMolecules(prev => prev.map(mol => {
      if (mol.reactionIndex === currentReaction && !mol.isProduct) {
        return {
          ...mol,
          targetX: 45 + (Math.random() * 10 - 5),
          targetY: 50 + (Math.random() * 10 - 5),
          x: 45 + (Math.random() * 10 - 5),
          y: 50 + (Math.random() * 10 - 5)
        };
      }
      return mol;
    }));

    // After combining, create products
    setTimeout(() => {
      setAnimationStep('reacting');

      setMolecules(prev => {
        const updated = prev.map(mol => {
          if (mol.reactionIndex === currentReaction && !mol.isProduct) {
            return { ...mol, opacity: 0, scale: 0 };
          }
          return mol;
        });

        // Add products
        const newProducts: AnimatedMolecule[] = [];
        let productId = prev.length + currentReaction * 100;

        products.forEach((product, pIdx) => {
          for (let i = 0; i < product.coeff; i++) {
            newProducts.push({
              id: productId++,
              formula: product.formula,
              color: product.color,
              x: 45 + (pIdx * 10) + (i * 5),
              y: 80 + currentReaction * 12,
              opacity: 1,
              scale: 1,
              isProduct: true,
              reactionIndex: currentReaction
            });
          }
        });

        return [...updated, ...newProducts];
      });

      setAnimationStep('products');
      setCurrentReaction(prev => prev + 1);
    }, 600);
  }, [currentReaction, timesReactionRuns, products, onAnimationComplete]);

  // Auto-play animation
  useEffect(() => {
    if (autoPlay && animationStep === 'initial') {
      const timer = setTimeout(runReaction, 500);
      return () => clearTimeout(timer);
    }
    if (autoPlay && animationStep === 'products' && currentReaction < timesReactionRuns) {
      const timer = setTimeout(runReaction, 800);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, animationStep, currentReaction, runReaction, timesReactionRuns]);

  // Get animation class
  const getAnimationClass = (mol: AnimatedMolecule) => {
    if (animationStep === 'combining' && mol.reactionIndex === currentReaction && !mol.isProduct) {
      return 'transition-all duration-500 ease-in-out';
    }
    if (mol.isProduct) {
      return 'animate-bounce-in';
    }
    return 'transition-all duration-300';
  };

  // Count visible molecules
  const visibleR1 = molecules.filter(m => m.formula === reactant1.formula && m.opacity > 0).length;
  const visibleR2 = molecules.filter(m => m.formula === reactant2.formula && m.opacity > 0).length;
  const visibleProducts = molecules.filter(m => m.isProduct && m.opacity > 0).length;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      {/* Animation area */}
      <div className="relative w-full h-48 bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        {/* Reaction zone indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-24 h-24 rounded-full border-4 border-dashed transition-all duration-500 ${
            animationStep === 'combining' || animationStep === 'reacting'
              ? 'border-orange-400 bg-orange-50/50 scale-110'
              : 'border-gray-200 bg-gray-50/30'
          }`}>
            {animationStep === 'reacting' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-pulse">💥</span>
              </div>
            )}
          </div>
        </div>

        {/* Molecules */}
        {molecules.map(mol => (
          <div
            key={mol.id}
            className={`absolute ${getAnimationClass(mol)}`}
            style={{
              left: `${mol.x}%`,
              top: `${mol.y}%`,
              transform: `translate(-50%, -50%) scale(${mol.scale})`,
              opacity: mol.opacity,
            }}
          >
            <Molecule
              formula={mol.formula}
              color={mol.color}
              size={mol.isProduct ? 35 : 30}
              className={mol.isProduct ? 'ring-2 ring-green-400 ring-offset-1' : ''}
            />
          </div>
        ))}

        {/* Labels */}
        <div className="absolute top-1 left-2 text-xs text-gray-500 font-medium">
          {reactant1.formula}
        </div>
        <div className="absolute top-1 right-2 text-xs text-gray-500 font-medium">
          {reactant2.formula}
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-medium">
          Afurðir
        </div>
      </div>

      {/* Status display */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
        <div className={`p-2 rounded-lg ${limitingIsR1 && showResult ? 'bg-red-100 border border-red-300' : 'bg-blue-50'}`}>
          <div className="font-bold text-blue-700">{visibleR1}</div>
          <div className="text-xs text-gray-600">{reactant1.formula}</div>
          {limitingIsR1 && showResult && <div className="text-xs text-red-600 font-bold">Takmarkandi!</div>}
        </div>
        <div className={`p-2 rounded-lg ${!limitingIsR1 && showResult ? 'bg-red-100 border border-red-300' : 'bg-red-50'}`}>
          <div className="font-bold text-red-700">{visibleR2}</div>
          <div className="text-xs text-gray-600">{reactant2.formula}</div>
          {!limitingIsR1 && showResult && <div className="text-xs text-red-600 font-bold">Takmarkandi!</div>}
        </div>
        <div className="bg-green-50 p-2 rounded-lg">
          <div className="font-bold text-green-700">{visibleProducts}</div>
          <div className="text-xs text-gray-600">Afurðir</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={runReaction}
          disabled={animationStep === 'combining' || animationStep === 'reacting' || currentReaction >= timesReactionRuns}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            currentReaction >= timesReactionRuns
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {currentReaction >= timesReactionRuns ? '✓ Búið' : `🔬 Hvarf ${currentReaction + 1}/${timesReactionRuns}`}
        </button>
        <button
          onClick={initializeMolecules}
          className="py-2 px-4 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
        >
          🔄
        </button>
      </div>

      {/* Result summary */}
      {showResult && animationStep === 'complete' && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-sm font-bold text-yellow-800 mb-1">Niðurstaða:</div>
          <div className="text-xs text-gray-700 space-y-1">
            <div>Hvörfin gátu gerst <strong>{timesReactionRuns}</strong> sinnum</div>
            <div>
              Afgangur: <strong>{limitingIsR1 ? excessR2 : excessR1}</strong>{' '}
              {limitingIsR1 ? reactant2.formula : reactant1.formula}
            </div>
            <div>
              Afurðir mynduðust:{' '}
              {products.map((p, i) => (
                <span key={p.formula}>
                  <strong>{p.coeff * timesReactionRuns}</strong> {p.formula}
                  {i < products.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS for bounce animation */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
