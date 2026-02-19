import { useState } from 'react';

import { useParams, Link } from 'react-router-dom';

import { DownloadButton } from '../components/DownloadButton';
import { LevelSelector } from '../components/LevelSelector';
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

export function SpjaldPage() {
  const { flokkur } = useParams<{ flokkur: string }>();
  const category = getCategoryById(flokkur || '');
  const [level, setLevel] = useState<Level>('A1');
  const [activeTab, setActiveTab] = useState<ViewTab>('spurningaspjald');

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Flokkur fannst ekki
        </h1>
        <p className="text-gray-600 mb-8">
          Þessi flokkur er ekki til. Veldu annan flokk af forsíðunni.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Til baka
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Brauðmolar" className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
          <h1 className="text-2xl font-bold">{category.name}</h1>
        </div>
        <p className="text-gray-600">{category.description}</p>
      </div>

      {/* Level selector */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Veldu erfiðleikastig
        </h2>
        <LevelSelector selected={level} onChange={setLevel} color={category.color} />
      </div>

      {/* Download button */}
      <div className="mb-10">
        <DownloadButton
          categoryId={category.id}
          level={level}
          color={category.color}
        />
      </div>

      {/* Tab navigation */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl max-w-lg mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview content */}
      <div className="max-w-lg mx-auto">
        {activeTab === 'spurningaspjald' && (
          <SpurningaSpjald category={category} level={level} />
        )}
        {activeTab === 'ordafordi' && (
          <SpjaldPreview category={category} level={level} view="front" />
        )}
        {activeTab === 'setningarammar' && (
          <SpjaldPreview category={category} level={level} view="back" />
        )}
      </div>
    </div>
  );
}
