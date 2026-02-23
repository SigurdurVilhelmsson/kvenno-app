import { Link } from 'react-router-dom';

import { Breadcrumbs, Card, Badge } from '@kvenno/shared/components';
import type { BreadcrumbItem } from '@kvenno/shared/components';

type YearKey = '1-ar' | '2-ar' | '3-ar';

interface GamesHubProps {
  year: YearKey;
}

interface GameCard {
  title: string;
  description: string;
  /** Filename without .html extension */
  slug: string;
}

interface YearGamesConfig {
  breadcrumbLabel: string;
  yearLabel: string;
  games: GameCard[];
}

const yearGamesConfigs: Record<YearKey, YearGamesConfig> = {
  '1-ar': {
    breadcrumbLabel: '1. ár',
    yearLabel: '1. árs',
    games: [
      {
        title: 'Takmarkandi hvarfefni',
        description: 'Takmarkandi hvarfefni og afurðir',
        slug: 'takmarkandi',
      },
      {
        title: 'Mólmassi',
        description: 'Læra um mólmassa efna',
        slug: 'molmassi',
      },
      {
        title: 'Nafnapör – Efnanöfn',
        description: 'Læra nöfn efnasambanda með minnisleik',
        slug: 'nafnakerfid',
      },
      {
        title: 'Lausnir',
        description: 'Mólstyrkur og útþynning lausna',
        slug: 'lausnir',
      },
      {
        title: 'Einingagreining',
        description: 'Námsleikur um einingagreiningu í efnafræði',
        slug: 'dimensional-analysis',
      },
    ],
  },
  '2-ar': {
    breadcrumbLabel: '2. ár',
    yearLabel: '2. árs',
    games: [
      {
        title: 'Lögmál Hess',
        description: 'Lærðu um lögmál Hess og orkubreytingar í efnahvörfum',
        slug: 'hess-law',
      },
      {
        title: 'Hvarfhraði',
        description: 'Lærðu um hvarfhraða, hraðalögmál og hvarfgangshátt í efnahvörfum',
        slug: 'kinetics',
      },
      {
        title: 'Lewis-formúlur',
        description: 'Lærðu að teikna Lewis-formúlur og skilja rafeindasamsetningu sameinda',
        slug: 'lewis-structures',
      },
      {
        title: 'VSEPR Rúmfræði',
        description: 'Lærðu um lögun sameinda með VSEPR kenningunni',
        slug: 'vsepr-geometry',
      },
      {
        title: 'Millisameindakraftar',
        description: 'Lærðu um millisameindakrafta og áhrif þeirra á eðliseiginleika',
        slug: 'intermolecular-forces',
      },
      {
        title: 'Lífræn nafnagift',
        description: 'Lærðu IUPAC nafnakerfið fyrir alkanar, alkenar og alkynar',
        slug: 'organic-nomenclature',
      },
      {
        title: 'Oxun og afoxun',
        description: 'Lærðu um oxunartölur, rafeindiflutning og jafnvægi redox-hvörfum',
        slug: 'redox-reactions',
      },
    ],
  },
  '3-ar': {
    breadcrumbLabel: '3. ár',
    yearLabel: '3. árs',
    games: [
      {
        title: 'pH Títrun',
        description: 'Gagnvirkur leikur um sýru-basa títrun',
        slug: 'ph-titration',
      },
      {
        title: 'Gaslögmál',
        description: 'Gagnvirkur leikur um gaslögmálin (PV=nRT) með agnasýn',
        slug: 'gas-law-challenge',
      },
      {
        title: 'Jafnvægisstjóri',
        description: 'Læra um Le Chatelier meginregluna',
        slug: 'equilibrium-shifter',
      },
      {
        title: 'Varmafræði spámaður',
        description: 'Læra um efnahvörf og varmafræði',
        slug: 'thermodynamics-predictor',
      },
      {
        title: 'Púfferuppskrift',
        description: 'Henderson-Hasselbalch jafnan og púfferlausnir',
        slug: 'buffer-recipe-creator',
      },
    ],
  },
};

export function GamesHub({ year }: GamesHubProps) {
  const config = yearGamesConfigs[year];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heim', href: '/' },
    { label: 'Efnafræði', href: '/efnafraedi' },
    { label: config.breadcrumbLabel, href: `/efnafraedi/${year}` },
    { label: 'Leikir' },
  ];

  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Back Button */}
      <Link
        to={`/efnafraedi/${year}`}
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 min-h-[44px] border-2 border-kvenno-orange text-kvenno-orange no-underline rounded-btn font-medium transition-all duration-200 ease-out hover:bg-kvenno-orange hover:text-white"
        aria-label={`Fara til baka í ${config.yearLabel} efnafræði`}
      >
        &larr; Til baka
      </Link>

      {/* Page Title */}
      <Card variant="elevated" padding="lg" className="text-center mb-12">
        <h1 className="font-heading text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-2">
          Leikir og æfingar – {config.yearLabel}
        </h1>
        <p className="text-lg text-warm-500">Veldu leik til að æfa þig</p>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mb-12">
        {config.games.map((game) => (
          <a
            key={game.slug}
            href={`/efnafraedi/${year}/games/${game.slug}.html`}
            className="bg-surface-raised border-2 border-kvenno-orange rounded-card p-8 no-underline text-warm-800 shadow-md flex flex-col transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-orange"
          >
            <h2 className="font-heading text-kvenno-orange text-2xl font-bold mb-4">
              {game.title}
            </h2>
            <p className="text-warm-500 flex-grow">{game.description}</p>
            <Badge variant="success" className="mt-4 self-start">
              ✓ Í notkun
            </Badge>
          </a>
        ))}
      </div>
    </>
  );
}
