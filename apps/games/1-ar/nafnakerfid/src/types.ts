import { Compound } from './data/compounds';

export interface Card {
  id: string;
  type: 'formula' | 'name';
  compound: Compound;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  cards: Card[];
  flippedCards: string[];
  matchedPairs: number;
  moves: number;
  gameStarted: boolean;
  gameComplete: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  pairCount: 6 | 8 | 10;
}
