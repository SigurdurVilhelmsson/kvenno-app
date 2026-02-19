import { Link } from 'react-router-dom';

interface NavTile {
  to: string;
  title: string;
  description: string;
}

const navTiles: NavTile[] = [
  {
    to: '/1-ar',
    title: '1. ár',
    description: 'Verkfæri fyrir fyrsta árs efnafræði',
  },
  {
    to: '/2-ar',
    title: '2. ár',
    description: 'Verkfæri fyrir annað árs efnafræði',
  },
  {
    to: '/3-ar',
    title: '3. ár',
    description: 'Verkfæri fyrir þriðja árs efnafræði',
  },
  {
    to: '/val',
    title: 'Valgreinar',
    description: 'Verkfæri fyrir valgreinar í efnafræði',
  },
  {
    to: '/f-bekkir',
    title: 'F-bekkir',
    description: 'Verkfæri fyrir félags- og hugvísindabraut',
  },
];

function Home() {
  return (
    <>
      {/* Intro Section */}
      <section className="text-center py-12 px-8 bg-white rounded-xl mb-12 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <h1 className="text-kvenno-orange text-4xl md:text-[2.5rem] font-bold mb-4">
          Velkomin í Kvenno Efnafræði
        </h1>
        <p className="text-lg text-gray-500 max-w-[800px] mx-auto">
          Safn af gagnvirkum verkfærum fyrir efnafræðikennslu við Kvennaskólann í Reykjavík.
          Veldu áfanga hér að neðan til að skoða tiltæk verkfæri.
        </p>
      </section>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mb-12">
        {navTiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="bg-white border-[3px] border-kvenno-orange rounded-xl py-12 px-8 text-center no-underline text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 hover:bg-kvenno-orange hover:text-white hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(243,107,34,0.3)] group"
          >
            <h2 className="text-[2rem] font-bold mb-2">
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

export default Home;
