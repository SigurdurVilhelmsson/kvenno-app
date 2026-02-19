import { Link } from 'react-router-dom';
import { tracks } from '../config/tracks';

function Home() {
  return (
    <>
      {/* Intro Section */}
      <section className="text-center py-12 px-8 bg-white rounded-xl mb-12 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <h1 className="text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-4">
          Velkomin á Námsvef Kvennó
        </h1>
        <p className="text-lg text-gray-500 max-w-[800px] mx-auto">
          Safn af gagnvirkum námsverkfærum fyrir nemendur og kennara við Kvennaskólann í Reykjavík.
          Veldu braut hér að neðan til að skoða tiltæk verkfæri.
        </p>
      </section>

      {/* Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mb-12">
        {tracks.map((track) =>
          track.isExternal ? (
            <a
              key={track.id}
              href={track.path}
              className="bg-white border-[3px] border-kvenno-orange rounded-xl py-12 px-8 text-center no-underline text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 hover:bg-kvenno-orange hover:text-white hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(243,107,34,0.3)] group"
            >
              <div className="text-5xl mb-4">{track.icon}</div>
              <h2 className="text-[2rem] font-bold mb-2">{track.title}</h2>
              <p className="text-base opacity-80">{track.description}</p>
            </a>
          ) : (
            <Link
              key={track.id}
              to={track.path}
              className="bg-white border-[3px] border-kvenno-orange rounded-xl py-12 px-8 text-center no-underline text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 hover:bg-kvenno-orange hover:text-white hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(243,107,34,0.3)] group"
            >
              <div className="text-5xl mb-4">{track.icon}</div>
              <h2 className="text-[2rem] font-bold mb-2">{track.title}</h2>
              <p className="text-base opacity-80">{track.description}</p>
            </Link>
          )
        )}
      </div>
    </>
  );
}

export default Home;
