import { formatDecimal } from '@shared/utils';

import type { GasValue } from '../types';

/**
 * A given as `Gefnar upplýsingar` prints it: its stated label when the number alone
 * cannot carry the figures (`2,0` L, `1,0` atm), else the value with the decimal comma.
 */
export function givenLabel(given: GasValue): string {
  return given.label ?? formatDecimal(given.value);
}
