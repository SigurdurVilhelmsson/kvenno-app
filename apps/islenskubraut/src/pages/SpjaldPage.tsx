import { useRef, useState, type KeyboardEvent } from 'react';

import { useParams, useSearchParams, Link } from 'react-router-dom';

import { Container } from '@kvenno/shared/components';

import { DownloadButton } from '../components/DownloadButton';
import { LEVELS, LevelSelector } from '../components/LevelSelector';
import { SpjaldPreview } from '../components/SpjaldPreview';
import { SpurningaSpjald } from '../components/SpurningaSpjald';
import { getCategoryById } from '../data';
import { Level } from '../data/types';

type ViewTab = 'spurningaspjald' | 'ordafordi' | 'setningarammar';

const TABS: { id: ViewTab; label: string }[] = [
  { id: 'spurningaspjald', label: 'Spurningaspjald' },
  { id: 'ordafordi', label: 'Orðaforði' },
  { id: 'setningarammar', label: 'Setningarammar' },
];

/** The level lives in the URL (`?stig=B1`), so a card can be bookmarked and shared. */
function parseLevel(value: string | null): Level {
  return LEVELS.find((l) => l.value === value)?.value ?? 'A1';
}

export function SpjaldPage() {
  const { flokkur } = useParams<{ flokkur: string }>();
  const category = getCategoryById(flokkur || '');
  const [searchParams, setSearchParams] = useSearchParams();
  const level = parseLevel(searchParams.get('stig'));
  const setLevel = (next: Level) => setSearchParams({ stig: next }, { replace: true });
  const [activeTab, setActiveTab] = useState<ViewTab>('spurningaspjald');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys, Home and End move between tabs, as in the WAI-ARIA tabs pattern.
  const onTabKeyDown = (event: KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % TABS.length
        : event.key === 'ArrowLeft'
          ? (index + last) % TABS.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  if (!category) {
    return (
      <Container className="py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-warm-900 mb-4">Flokkur fannst ekki</h1>
        <p className="text-warm-600 mb-8">
          Þessi flokkur er ekki til. Veldu annan flokk af forsíðunni.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-warm-600 hover:text-warm-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Til baka
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Brauðmolar" className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-warm-500 hover:text-warm-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Allir flokkar
        </Link>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div
          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl text-white"
          style={{ backgroundColor: category.color }}
        >
          <span className="text-3xl">{category.icon}</span>
          <h1 className="font-heading text-2xl font-bold">{category.name}</h1>
        </div>
        <p className="text-warm-600">{category.description}</p>
      </div>

      {/* Level selector */}
      <div className="mb-8">
        <h2
          id="erfidleikastig"
          className="font-heading text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3"
        >
          Veldu erfiðleikastig
        </h2>
        <LevelSelector
          selected={level}
          onChange={setLevel}
          color={category.color}
          labelledBy="erfidleikastig"
        />
      </div>

      {/* Download button */}
      <div className="mb-10">
        <DownloadButton categoryId={category.id} level={level} color={category.color} />
      </div>

      {/* Tab navigation */}
      <div className="mb-6">
        <div
          role="tablist"
          aria-label="Hlutar spjaldsins"
          className="flex gap-1 p-1 bg-warm-100 rounded-xl max-w-lg mx-auto"
        >
          {TABS.map((tab, index) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`flipi-${tab.id}`}
                aria-selected={selected}
                aria-controls="spjald-synishorn"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                  selected
                    ? 'bg-surface-raised text-warm-900 shadow-xs'
                    : 'text-warm-600 hover:text-warm-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview content */}
      <div
        role="tabpanel"
        id="spjald-synishorn"
        aria-labelledby={`flipi-${activeTab}`}
        tabIndex={0}
        className="max-w-lg mx-auto"
      >
        {activeTab === 'spurningaspjald' && <SpurningaSpjald category={category} level={level} />}
        {activeTab === 'ordafordi' && (
          <SpjaldPreview category={category} level={level} view="front" />
        )}
        {activeTab === 'setningarammar' && (
          <SpjaldPreview category={category} level={level} view="back" />
        )}
      </div>
    </Container>
  );
}
