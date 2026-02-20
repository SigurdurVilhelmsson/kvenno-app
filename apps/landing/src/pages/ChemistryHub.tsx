import { Link } from 'react-router-dom';

import { Breadcrumbs, Button, Card } from '@kvenno/shared/components';
import type { BreadcrumbItem } from '@kvenno/shared/components';

interface NavTile {
  to: string;
  title: string;
  description: string;
}

const navTiles: NavTile[] = [
  {
    to: '/efnafraedi/1-ar',
    title: '1. ár',
    description: 'Verkfæri fyrir fyrsta árs efnafræði',
  },
  {
    to: '/efnafraedi/2-ar',
    title: '2. ár',
    description: 'Verkfæri fyrir annað árs efnafræði',
  },
  {
    to: '/efnafraedi/3-ar',
    title: '3. ár',
    description: 'Verkfæri fyrir þriðja árs efnafræði',
  },
  {
    to: '/efnafraedi/val',
    title: 'Valgreinar',
    description: 'Verkfæri fyrir valgreinar í efnafræði',
  },
  {
    to: '/efnafraedi/f-bekkir',
    title: 'F-bekkir',
    description: 'Verkfæri fyrir félags- og hugvísindabraut',
  },
];

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Heim', href: '/' },
  { label: 'Efnafræði' },
];

export function ChemistryHub() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Back Button */}
      <Button as="a" href="/" variant="secondary" className="mb-8 no-underline" aria-label="Fara til baka á heimasíðu">
        &larr; Til baka
      </Button>

      {/* Intro Section */}
      <Card variant="elevated" padding="lg" className="text-center mb-12">
        <h1 className="font-heading text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-4">
          Efnafræði
        </h1>
        <p className="text-lg text-warm-500 max-w-[800px] mx-auto">
          Safn af gagnvirkum verkfærum fyrir efnafræðikennslu við Kvennaskólann í Reykjavík.
          Veldu áfanga hér að neðan til að skoða tiltæk verkfæri.
        </p>
      </Card>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mb-12">
        {navTiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="bg-surface-raised border-2 border-kvenno-orange rounded-card py-12 px-8 text-center no-underline text-warm-800 shadow-md cursor-pointer transition-all duration-200 ease-out hover:bg-kvenno-orange hover:text-white hover:-translate-y-0.5 hover:shadow-orange group"
          >
            <h2 className="font-heading text-[2rem] font-bold mb-2">
              {tile.title}
            </h2>
            <p className="text-base opacity-80">
              {tile.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
