import { Link } from 'react-router-dom';

import { Breadcrumbs, Card, Badge } from '@kvenno/shared/components';
import type { BreadcrumbItem } from '@kvenno/shared/components';

type YearKey = '1-ar' | '2-ar' | '3-ar' | 'val' | 'f-bekkir';

interface YearHubProps {
  year: YearKey;
}

interface ToolCard {
  title: string;
  description: string;
  href: string;
  status: string;
  /** Tool is actively in use */
  active?: boolean;
  /** Tool is planned / not yet available */
  comingSoon?: boolean;
}

interface YearConfig {
  breadcrumbLabel: string;
  pageTitle: string;
  pageDescription: string;
  tools: ToolCard[];
  /** If true, show empty state instead of tools grid */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const yearConfigs: Record<YearKey, YearConfig> = {
  '1-ar': {
    breadcrumbLabel: '1. ár',
    pageTitle: '1. árs efnafræði',
    pageDescription: 'Gagnvirk verkfæri fyrir nemendur í fyrsta árs efnafræði',
    tools: [
      {
        title: 'AI Efnafræðikennari',
        description:
          'Spurðu spurninga og fáðu skýringar á efnafræðihugtökum með hjálp gervigreindar. Kennarinn útskýrir hugtök og hjálpar þér að skilja efnið betur.',
        href: '/efnafraedi/1-ar/ai-tutor/',
        status: 'Í þróun - Ræsing í janúar 2026',
        comingSoon: true,
      },
      {
        title: 'Leikir og æfingar',
        description:
          'Skemmtilegar æfingar og leikir til að þjálfa þekkingu þína á atómum, efnatengjum og efnahvörfum.',
        href: '/efnafraedi/1-ar/games/',
        status: 'Væntanlegt',
      },
      {
        title: 'Reiknitæki',
        description: 'Útreikningar og umbreytingar fyrir algeng efnafræðiverkefni.',
        href: '#',
        status: 'Í áætlun',
        comingSoon: true,
      },
      {
        title: 'Lotukerfið',
        description: 'Gagnvirkt lotukerfið með upplýsingum um öll frumefni.',
        href: '#',
        status: 'Í áætlun',
        comingSoon: true,
      },
    ],
  },
  '2-ar': {
    breadcrumbLabel: '2. ár',
    pageTitle: '2. árs efnafræði',
    pageDescription: 'Gagnvirk verkfæri fyrir nemendur í annað árs efnafræði',
    tools: [
      {
        title: 'Tilraunaskýrslur',
        description:
          'Forrit fyrir nemendur til að skrifa og skila inn tilraunaskýrslum. Fáðu endurgjöf frá gervigreind og sendu til kennarans þegar tilbúið.',
        href: '/efnafraedi/2-ar/lab-reports/',
        status: '\u2713 Í notkun',
        active: true,
      },
      {
        title: 'AI Efnafræðikennari',
        description:
          'Spurðu spurninga og fáðu skýringar á efnafræðihugtökum með hjálp gervigreindar. Kennarinn útskýrir hugtök og hjálpar þér að skilja efnið betur.',
        href: '/efnafraedi/2-ar/ai-tutor/',
        status: 'Í þróun - Ræsing í janúar 2026',
        comingSoon: true,
      },
      {
        title: 'Leikir og æfingar',
        description:
          'Skemmtilegar æfingar og leikir til að þjálfa þekkingu þína á efnajafnvægi, sýrum og bösum, og hraðafræði.',
        href: '/efnafraedi/2-ar/games/',
        status: 'Væntanlegt',
      },
      {
        title: 'Efnahvörfur',
        description: 'Gagnvirk verkfæri til að æfa jöfnun efnahvarfa og reikna hlutföll.',
        href: '#',
        status: 'Í áætlun',
        comingSoon: true,
      },
      {
        title: 'Titrunarkúrfur',
        description: 'Gagnvirkar titrunarkúrfur til að skilja sýru-basa jafnvægi.',
        href: '#',
        status: 'Í áætlun',
        comingSoon: true,
      },
    ],
  },
  '3-ar': {
    breadcrumbLabel: '3. ár',
    pageTitle: '3. árs efnafræði',
    pageDescription: 'Gagnvirk verkfæri fyrir nemendur í þriðja árs efnafræði',
    tools: [
      {
        title: 'Tilraunaskýrslur',
        description:
          'Forrit fyrir nemendur til að skrifa og skila inn tilraunaskýrslum. Fáðu endurgjöf frá gervigreind og sendu til kennarans þegar tilbúið.',
        href: '/efnafraedi/3-ar/lab-reports/',
        status: '\u2713 Í notkun',
        active: true,
      },
      {
        title: 'AI Efnafræðikennari',
        description:
          'Spurðu spurninga og fáðu skýringar á efnafræðihugtökum með hjálp gervigreindar. Kennarinn útskýrir hugtök og hjálpar þér að skilja efnið betur.',
        href: '/efnafraedi/3-ar/ai-tutor/',
        status: 'Í þróun - Ræsing í janúar 2026',
        comingSoon: true,
      },
      {
        title: 'Leikir og æfingar',
        description:
          'Skemmtilegar æfingar og leikir til að þjálfa þekkingu þína á lífræna efnafræði, rafsegulfræði og hvarfafræði.',
        href: '/efnafraedi/3-ar/games/',
        status: 'Væntanlegt',
      },
      {
        title: 'Sameindagerð',
        description: 'Gagnvirkur sameindagerðarforrit til að sjá þrívíð módel af sameindagerð.',
        href: '#',
        status: 'Í áætlun',
        comingSoon: true,
      },
      {
        title: 'Litrófsgreining',
        description: 'Lærðu að túlka litróf með gagnvirkum verkfærum.',
        href: '#',
        status: 'Í áætlun',
        comingSoon: true,
      },
    ],
  },
  val: {
    breadcrumbLabel: 'Valgreinar',
    pageTitle: 'Valgreinar í efnafræði',
    pageDescription: 'Gagnvirk verkfæri fyrir valgreinar í efnafræði',
    tools: [],
    isEmpty: true,
    emptyTitle: 'Væntanlegt',
    emptyDescription:
      'Verkfæri fyrir valgreinar í efnafræði eru í áætlun. Hafðu samband við kennara þinn ef þú hefur tillögur að verkfærum sem gætu hjálpað þér í námi.',
  },
  'f-bekkir': {
    breadcrumbLabel: 'F-bekkir',
    pageTitle: 'Efnafræði fyrir félags- og hugvísindabraut',
    pageDescription: 'Gagnvirk verkfæri fyrir nemendur í F-bekk',
    tools: [],
    isEmpty: true,
    emptyTitle: 'Væntanlegt',
    emptyDescription:
      'Verkfæri fyrir efnafræði í félags- og hugvísindabraut eru í áætlun. Þessi verkfæri munu einblína á hagnýta efnafræði og tengsl hennar við daglegt líf og samfélag. Hafðu samband við kennara þinn ef þú hefur tillögur að verkfærum sem gætu hjálpað þér í námi.',
  },
};

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  if (tool.comingSoon) {
    return (
      <Card
        variant="outlined"
        padding="lg"
        className="opacity-60 border-dashed cursor-not-allowed flex flex-col"
        role="article"
        aria-disabled="true"
      >
        <h2 className="text-kvenno-orange text-2xl font-bold mb-4">{tool.title}</h2>
        <p className="text-warm-500 flex-grow">{tool.description}</p>
        <span className="mt-4 text-sm text-warm-400 italic">{tool.status}</span>
      </Card>
    );
  }

  return (
    <a
      href={tool.href}
      className="bg-surface-raised border-2 border-kvenno-orange rounded-card p-8 no-underline text-warm-800 shadow-md flex flex-col transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-orange"
    >
      <h2 className="font-heading text-kvenno-orange text-2xl font-bold mb-4">{tool.title}</h2>
      <p className="text-warm-500 flex-grow">{tool.description}</p>
      {tool.active ? (
        <Badge variant="success" className="mt-4 self-start">
          {tool.status}
        </Badge>
      ) : (
        <span className="mt-4 text-sm text-warm-400 italic">{tool.status}</span>
      )}
    </a>
  );
}

export function YearHub({ year }: YearHubProps) {
  const config = yearConfigs[year];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Heim', href: '/' },
    { label: 'Efnafræði', href: '/efnafraedi' },
    { label: config.breadcrumbLabel },
  ];

  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Back Button */}
      <Link
        to="/efnafraedi"
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 min-h-[44px] border-2 border-kvenno-orange text-kvenno-orange no-underline rounded-btn font-medium transition-all duration-200 ease-out hover:bg-kvenno-orange hover:text-white"
        aria-label="Fara til baka í efnafræði"
      >
        &larr; Til baka
      </Link>

      {/* Page Title */}
      <Card variant="elevated" padding="lg" className="text-center mb-12">
        <h1 className="font-heading text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-2">
          {config.pageTitle}
        </h1>
        <p className="text-lg text-warm-500">{config.pageDescription}</p>
      </Card>

      {/* Tools Grid or Empty State */}
      {config.isEmpty ? (
        <Card variant="elevated" padding="lg" className="text-center">
          <h2 className="font-heading text-kvenno-orange text-3xl font-bold mb-4">
            {config.emptyTitle}
          </h2>
          <p className="text-warm-500 text-lg max-w-[600px] mx-auto">{config.emptyDescription}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mb-12">
          {config.tools.map((tool) => (
            <ToolCardComponent key={tool.title} tool={tool} />
          ))}
        </div>
      )}
    </>
  );
}
