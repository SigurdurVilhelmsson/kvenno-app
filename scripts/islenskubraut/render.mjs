import { format, resolveConfig } from 'prettier';

const WARNING = `// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.`;

/** JSON.stringify, not hand-rolled quoting: an escaping bug is what corrupted this data. */
const literal = (value) => JSON.stringify(value, null, 2);

export function renderSpaCategory(category) {
  return `${WARNING}

import { Category } from '../types';

export const ${category.id}: Category = ${literal(category)};
`;
}

export function renderServerModule(categories) {
  return `${WARNING}

import type { Category } from '../types/index.js';

export const categories: Category[] = ${literal(categories)};

export const categoryIds: string[] = categories.map((c) => c.id);

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
`;
}

/**
 * Format with the repo's prettier config.
 *
 * lint-staged runs `prettier --write` on commit, so unformatted output would be
 * rewritten the moment it was staged and `--check` would then report STALE
 * forever against identical content. A permanently red check is worse than none.
 */
export async function prettify(source, filepath) {
  const options = (await resolveConfig(filepath)) ?? {};
  return format(source, { ...options, filepath });
}
