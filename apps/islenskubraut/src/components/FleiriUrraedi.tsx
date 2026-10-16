import { tenglar, type Tengill } from '../data/tenglar';
import type { Level } from '../data/types';

const AUDIENCES: { id: Tengill['audience']; title: string }[] = [
  { id: 'nemendur', title: 'Fyrir nemendur' },
  { id: 'kennarar', title: 'Fyrir kennara' },
];

/**
 * The links on a card at a level. Only approved links, unless `drafts`, which the card page sets
 * from `?drog` so a teacher can review them before approving (content/islenskubraut/tenglar/).
 */
export function linksFor(categoryId: string, level: Level, drafts = false): Tengill[] {
  return tenglar.filter(
    (t) => t.levels.includes(level) && t.urls[categoryId] && (drafts || t.approved)
  );
}

/**
 * Fleiri úrræði: resources elsewhere that already do what this site should not rebuild, such as
 * picture dictionaries with audio, bilingual dictionaries and self-study courses
 * (docs/research/islenskubraut-additions/, item 1).
 */
export function FleiriUrraedi({
  categoryId,
  level,
  drafts = false,
  className = '',
}: {
  categoryId: string;
  level: Level;
  drafts?: boolean;
  className?: string;
}) {
  const links = linksFor(categoryId, level, drafts);
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="fleiri-urraedi" className={className}>
      <h2
        id="fleiri-urraedi"
        className="font-heading text-sm font-semibold text-warm-600 uppercase tracking-wider mb-3"
      >
        Fleiri úrræði
      </h2>
      {drafts && (
        <p
          role="note"
          className="mb-4 rounded-xl border border-warm-300 bg-warm-100 px-4 py-3 text-sm text-warm-800"
        >
          Drög: tenglar merktir „drög“ hafa ekki verið samþykktir og sjást ekki á síðunni.
        </p>
      )}
      <div className="space-y-6">
        {AUDIENCES.map(({ id, title }) => {
          const group = links.filter((t) => t.audience === id);
          if (group.length === 0) return null;
          return (
            <div key={id}>
              <h3 className="font-heading text-base font-semibold text-warm-800 mb-2">{title}</h3>
              <ul className="space-y-3">
                {group.map((t) => (
                  <li key={t.id}>
                    <a
                      href={t.urls[categoryId]}
                      className="font-semibold text-warm-900 underline hover:text-warm-600"
                    >
                      {t.name}
                    </a>
                    {drafts && !t.approved && (
                      <span className="ml-2 text-xs font-semibold text-warm-600">(drög)</span>
                    )}
                    <p className="text-sm text-warm-600">{t.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
