import { Link } from 'react-router-dom';

import { Container } from '@kvenno/shared/components';

import { categories } from '../data';

/**
 * Every category's sentence builder, confirmed or not, for a teacher reviewing the drafts (C9).
 * Nothing on the site links here: a student reaches a builder only from its card, and the card
 * links it only once a teacher has set `confirmed: true`. Reads the categories' tags, not the
 * sentences, so it stays out of the builder's lazy chunk.
 */
export function SmidurListi() {
  const builders = categories.flatMap((category) => {
    const a1 = category.builder?.find((b) => b.level === 'A1');
    return a1 ? [{ category, confirmed: a1.confirmed }] : [];
  });

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-warm-900 mb-4">
        Setningasmiðir
      </h1>
      <p className="max-w-2xl text-warm-600 mb-8">
        Yfirlit fyrir kennara. Engin síða á vefnum vísar hingað. Nemendur sjá setningasmið á
        spjaldinu aðeins þegar kennari hefur farið yfir setningarnar og staðfest þær.
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {builders.map(({ category, confirmed }) => (
          <li
            key={category.id}
            className="rounded-xl border-2 bg-surface-raised p-5 flex flex-col gap-3"
            style={{ borderColor: category.color }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                {category.icon}
              </span>
              <h2 className="font-heading text-xl font-bold text-warm-900">{category.name}</h2>
            </div>
            <p className="text-sm text-warm-800">
              A1:{' '}
              {confirmed ? (
                <span className="font-semibold">staðfest, birt á spjaldinu</span>
              ) : (
                <span className="font-semibold">drög, ekki birt nemendum</span>
              )}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link
                to={`/smidur/${category.id}`}
                className="font-semibold text-warm-900 underline hover:text-warm-600"
              >
                Opna setningasmið
                <span className="sr-only">: {category.name}</span>
              </Link>
              <Link
                to={`/spjald/${category.id}?stig=A1`}
                className="text-warm-600 underline hover:text-warm-900"
              >
                Spjald A1
                <span className="sr-only">: {category.name}</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
