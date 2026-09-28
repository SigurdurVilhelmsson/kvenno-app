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
        title: 'Einingagreining',
        description: 'Námsleikur um einingagreiningu í efnafræði',
        slug: 'dimensional-analysis',
      },
      {
        title: 'Lotukerfið',
        description: 'Kynntu þér lotukerfið, frumefni og atómbyggingu',
        slug: 'lotukerfid',
      },
      {
        title: 'Nafnakerfið',
        description: 'Læra nöfn efnasambanda og nafnareglur',
        slug: 'nafnakerfid',
      },
      {
        title: 'Mólhugtakið',
        description: 'Mólmassi, mól-umbreytingar og Avogadro-tala',
        slug: 'molmassi',
      },
      {
        title: 'Reynsluformúlur',
        description: 'Frá prósentusamsetningu að reynsluformúlu, og þaðan að sameindaformúlu',
        slug: 'reynsluformulur',
      },
      {
        title: 'Stilla efnajöfnur',
        description: 'Lærðu að stilla efnajöfnur',
        slug: 'stilla-efnajofnur',
      },
      {
        title: 'Útfellingarhvörf',
        description: 'Leysnireglur, botnfall og nettójónajöfnur',
        slug: 'utfellingarhvorf',
      },
      {
        title: 'Takmarkandi hvarfefni',
        description: 'Takmarkandi hvarfefni og hlutfallaefnafræði',
        slug: 'takmarkandi',
      },
      {
        title: 'Lausnir',
        description: 'Mólstyrkur og útþynning lausna',
        slug: 'lausnir',
      },
      {
        title: 'Einingakeðjan',
        description: 'Byggðu leiðina frá mælingu að svari og láttu einingarnar styttast út',
        slug: 'einingakedjan',
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
        description: 'Lærðu um hvarfhraða, hraðalögmál og hvarfgang í efnahvörfum',
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
        description: 'Lærðu IUPAC nafnakerfið fyrir alkana, alkena og alkýna',
        slug: 'organic-nomenclature',
      },
      {
        title: 'Oxun og afoxun',
        description: 'Lærðu um oxunartölur, rafeindaflutning og hvernig redox-hvörf eru stillt',
        slug: 'redox-reactions',
      },
      {
        title: 'Rafeindabygging',
        description: 'Skammtatölur, svigrúm og rafeindaskipan (Kafli 6)',
        slug: 'rafeindabygging',
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
        title: 'Jafnvægisfastinn',
        description: 'Kc, Kp, hvarfstuðullinn Q og ICE-töflur',
        slug: 'jafnvaegisfasti',
      },
      {
        title: 'Jafnvægisstjóri',
        description: 'Læra um Le Chatelier meginregluna',
        slug: 'equilibrium-shifter',
      },
      {
        title: 'Sýrufastinn',
        description: 'Hvað Ka er, hvaðan hann kemur og hvenær nálgunina má nota',
        slug: 'syrufastinn',
      },
      {
        title: 'Varmafræði spámaður',
        description: 'Læra um efnahvörf og varmafræði',
        slug: 'thermodynamics-predictor',
      },
      {
        title: 'Stuðpúðasmíði',
        description: 'Henderson-Hasselbalch jafnan og stuðpúðalausnir',
        slug: 'buffer-recipe-creator',
      },
      {
        title: 'Leysnijafnvægi',
        description: 'Leysnimargfeldi, mólarleysni, samjónahrif og hlutfelling',
        slug: 'leysnijafnvaegi',
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
      <div className="py-3 md:py-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Back Button */}
      <Link
        to={`/efnafraedi/${year}`}
        className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2 min-h-[44px] border-2 border-kvenno-orange text-kvenno-orange no-underline rounded-btn font-medium transition-all duration-200 ease-out hover:bg-kvenno-orange hover:text-white"
        aria-label={`Fara til baka í ${config.yearLabel} efnafræði`}
      >
        &larr; Til baka
      </Link>

      {/* Page Title. Phones get a tighter card and a 30px heading so the first
          games show above the fold; md: restores the desktop sizes. The year is
          kept on one line so the title cannot break between "1." and "árs". */}
      <Card variant="elevated" padding="none" className="text-center p-6 md:p-8 mb-8 md:mb-12">
        <h1 className="font-heading text-kvenno-orange text-3xl md:text-[2.5rem] md:leading-[calc(2.5/2.25)] font-bold mb-2">
          Leikir og æfingar <span className="whitespace-nowrap">– {config.yearLabel}</span>
        </h1>
        <p className="text-base md:text-lg text-warm-500">Veldu leik til að æfa þig</p>
      </Card>

      {/* Games Grid. One column on a phone held upright, two on one held
          sideways (sm:), and the desktop grid from md: on. The card padding and
          title size step down below md: so a long one-word title such as
          "Millisameindakraftar" fits a 320px screen, with wrap-break-word as the
          backstop; md:wrap-normal keeps tablet and desktop wrapping as it was. */}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-8 mb-12">
        {config.games.map((game) => (
          <a
            key={game.slug}
            href={`/efnafraedi/${year}/games/${game.slug}.html`}
            className="bg-surface-raised border-2 border-kvenno-orange rounded-card p-5 md:p-8 no-underline text-warm-800 shadow-md flex flex-col transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-orange"
          >
            <h2 className="font-heading text-kvenno-orange text-xl md:text-2xl font-bold mb-2 md:mb-4 wrap-break-word md:wrap-normal">
              {game.title}
            </h2>
            <p className="text-warm-500 flex-grow">{game.description}</p>
            <Badge variant="success" className="mt-3 md:mt-4 self-start">
              ✓ Í notkun
            </Badge>
          </a>
        ))}
      </div>
    </>
  );
}
