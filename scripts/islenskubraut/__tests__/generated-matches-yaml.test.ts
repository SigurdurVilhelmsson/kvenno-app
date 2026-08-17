import { describe, expect, it } from 'vitest';

import { categories as serverCategories } from '../../../server/src/lib/islenskubraut-data';
import { categories as spaCategories } from '../../../apps/islenskubraut/src/data/index';

describe('generated modules', () => {
  it('agree with each other', () => {
    expect(serverCategories).toEqual(spaCategories);
  });

  it('still ship all six categories in taught order', () => {
    expect(spaCategories.map((c) => c.id)).toEqual([
      'dyr',
      'matur',
      'farartaeki',
      'manneskja',
      'stadir',
      'klaednadur',
    ]);
  });

  it('carry the corrected strings from the August fix', () => {
    const manneskja = spaCategories.find((c) => c.id === 'manneskja');
    expect(manneskja?.guidingQuestions.map((q) => q.question)).toContain(
      'Fyrir hvað er manneskjan þekkt?'
    );
    const dyr = spaCategories.find((c) => c.id === 'dyr');
    expect(dyr?.description).toBe('Orðaforði um dýr — gæludýr, villt dýr og húsdýr');
  });
});
