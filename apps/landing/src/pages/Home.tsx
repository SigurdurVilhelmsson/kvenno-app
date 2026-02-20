import { Link } from 'react-router-dom';

import { Card } from '@kvenno/shared/components';

import { tracks } from '../config/tracks';

export function Home() {
  const cardClasses =
    'bg-surface-raised border-2 border-kvenno-orange rounded-card py-12 px-8 text-center no-underline text-warm-800 shadow-md cursor-pointer transition-all duration-200 ease-out hover:bg-kvenno-orange hover:text-white hover:-translate-y-0.5 hover:shadow-orange group';

  return (
    <>
      {/* Intro Section */}
      <Card variant="elevated" padding="lg" className="text-center mb-12">
        <h1 className="font-heading text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-4">
          Velkomin á Námsvef Kvennó
        </h1>
        <p className="text-lg text-warm-500 max-w-[800px] mx-auto">
          Safn af gagnvirkum námsverkfærum fyrir nemendur og kennara við Kvennaskólann í Reykjavík.
          Veldu braut hér að neðan til að skoða tiltæk verkfæri.
        </p>
      </Card>

      {/* Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mb-12">
        {tracks.map((track) =>
          track.isExternal ? (
            <a key={track.id} href={track.path} className={cardClasses}>
              <div className="text-5xl mb-4">{track.icon}</div>
              <h2 className="font-heading text-[2rem] font-bold mb-2">{track.title}</h2>
              <p className="text-base opacity-80">{track.description}</p>
            </a>
          ) : (
            <Link key={track.id} to={track.path} className={cardClasses}>
              <div className="text-5xl mb-4">{track.icon}</div>
              <h2 className="font-heading text-[2rem] font-bold mb-2">{track.title}</h2>
              <p className="text-base opacity-80">{track.description}</p>
            </Link>
          )
        )}
      </div>
    </>
  );
}
