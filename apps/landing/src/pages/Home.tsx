import { Link } from 'react-router-dom';

import { Card } from '@kvenno/shared/components';

import { tracks } from '../config/tracks';

export function Home() {
  const cardClasses =
    'bg-surface-raised border-2 border-kvenno-orange rounded-card py-8 px-5 md:py-12 md:px-8 text-center no-underline text-warm-800 shadow-md cursor-pointer transition-all duration-200 ease-out hover:bg-kvenno-orange hover:text-white hover:-translate-y-0.5 hover:shadow-orange group';

  return (
    <>
      {/* Intro Section. mt-4 on phones keeps the card clear of the sticky header. */}
      <Card
        variant="elevated"
        padding="none"
        className="text-center p-6 md:p-8 mt-4 md:mt-0 mb-8 md:mb-12"
      >
        <h1 className="font-heading text-kvenno-orange text-3xl md:text-[2.5rem] md:leading-[calc(2.5/2.25)] font-bold mb-4">
          Velkomin á Námsvef Kvennó
        </h1>
        <p className="text-base md:text-lg text-warm-500 max-w-[800px] mx-auto">
          Safn af gagnvirkum námsverkfærum fyrir nemendur og kennara við Kvennaskólann í Reykjavík.
          Veldu braut hér að neðan til að skoða tiltæk verkfæri.
        </p>
      </Card>

      {/* Track Grid. Shorter cards on phones, two columns on a phone held
          sideways (sm:); md: restores the desktop grid and card size. The title
          steps down to 28px so "Íslenskubraut" clears the card padding at 320px. */}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 md:gap-8 mb-12">
        {tracks.map((track) =>
          track.isExternal ? (
            <a key={track.id} href={track.path} className={cardClasses}>
              <div className="text-5xl mb-4">{track.icon}</div>
              <h2 className="font-heading text-[1.75rem] md:text-[2rem] font-bold mb-2">
                {track.title}
              </h2>
              <p className="text-base opacity-80">{track.description}</p>
            </a>
          ) : (
            <Link key={track.id} to={track.path} className={cardClasses}>
              <div className="text-5xl mb-4">{track.icon}</div>
              <h2 className="font-heading text-[1.75rem] md:text-[2rem] font-bold mb-2">
                {track.title}
              </h2>
              <p className="text-base opacity-80">{track.description}</p>
            </Link>
          )
        )}
      </div>
    </>
  );
}
