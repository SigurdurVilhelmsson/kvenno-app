/**
 * An Æfingarhamur round: every problem of the chosen difficulty once, in a random order.
 *
 * A round has an end, so it can report `N af M rétt` (mobile-pass decision 1 (b)); drawing at
 * random with replacement had none. The shuffle runs forward, so the first problem is the one
 * a single `Math.random()` draw picks, as it was before — the tests pin `Math.random` to a
 * problem's slot to open that problem.
 */
export function practiceDeck<T>(problems: readonly T[]): T[] {
  const deck = [...problems];
  for (let i = 0; i < deck.length - 1; i++) {
    const j = i + Math.floor(Math.random() * (deck.length - i));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
