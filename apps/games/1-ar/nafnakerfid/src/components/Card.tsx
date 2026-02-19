import { Card as CardType } from '../types';
import { CompoundVisualization } from './MolecularStructure';

interface CardProps {
  card: CardType;
  onClick: () => void;
  disabled: boolean;
  /** Show molecular structure visualization on formula cards */
  showStructure?: boolean;
}

export function Card({ card, onClick, disabled, showStructure = true }: CardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || card.isMatched}
      className={`card relative h-32 rounded-xl transition-all duration-300 ${
        card.isFlipped || card.isMatched ? 'flipped' : ''
      } ${card.isMatched ? 'matched opacity-50' : ''}`}
    >
      <div className="card-inner h-full">
        {/* Front (back of card - shows when not flipped) */}
        <div className="card-face absolute inset-0 bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center rounded-xl shadow-lg">
          <div className="text-4xl">🧪</div>
        </div>

        {/* Back (front of card - shows when flipped) */}
        <div className="card-face card-back absolute inset-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg flex flex-col items-center justify-center p-3 gap-2">
          {card.type === 'formula' ? (
            <>
              <div className="text-2xl font-bold text-gray-800 font-mono">
                {card.compound.formula}
              </div>
              {showStructure && (
                <CompoundVisualization compound={card.compound} size="small" showLabels={true} />
              )}
            </>
          ) : (
            <>
              <div className="text-base font-semibold text-gray-800 leading-tight text-center">
                {card.compound.name}
              </div>
              {showStructure && (
                <CompoundVisualization compound={card.compound} size="small" showLabels={false} />
              )}
            </>
          )}
        </div>
      </div>
    </button>
  );
}
