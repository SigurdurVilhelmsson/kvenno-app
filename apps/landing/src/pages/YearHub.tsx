import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@kvenno/shared/components';
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
  const baseClasses =
    'bg-white border-2 border-kvenno-orange rounded-xl p-8 no-underline text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)] flex flex-col transition-all duration-300';

  if (tool.comingSoon) {
    return (
      <div
        className={`${baseClasses} opacity-60 border-dashed cursor-not-allowed`}
        role="article"
        aria-disabled="true"
      >
        <h2 className="text-kvenno-orange text-2xl font-bold mb-4">{tool.title}</h2>
        <p className="text-gray-500 flex-grow">{tool.description}</p>
        <span className="mt-4 text-sm text-gray-400 italic">{tool.status}</span>
      </div>
    );
  }

  return (
    <a
      href={tool.href}
      className={`${baseClasses} hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(243,107,34,0.3)]`}
    >
      <h2 className="text-kvenno-orange text-2xl font-bold mb-4">{tool.title}</h2>
      <p className="text-gray-500 flex-grow">{tool.description}</p>
      <span
        className={`mt-4 text-sm ${
          tool.active ? 'text-green-600 font-bold not-italic' : 'text-gray-400 italic'
        }`}
      >
        {tool.status}
      </span>
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
        className="inline-block mb-8 py-3 px-6 bg-white border-2 border-kvenno-orange text-kvenno-orange no-underline rounded-lg transition-all duration-300 hover:bg-kvenno-orange hover:text-white"
        aria-label="Fara til baka í efnafræði"
      >
        &larr; Til baka
      </Link>

      {/* Page Title */}
      <section className="text-center py-8 px-8 bg-white rounded-xl mb-12 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <h1 className="text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-2">
          {config.pageTitle}
        </h1>
        <p className="text-lg text-gray-500">{config.pageDescription}</p>
      </section>

      {/* Tools Grid or Empty State */}
      {config.isEmpty ? (
        <div className="text-center py-16 px-8 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          <h2 className="text-kvenno-orange text-3xl font-bold mb-4">{config.emptyTitle}</h2>
          <p className="text-gray-500 text-lg max-w-[600px] mx-auto">
            {config.emptyDescription}
          </p>
        </div>
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

