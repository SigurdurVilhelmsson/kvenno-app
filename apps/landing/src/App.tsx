import { Routes, Route } from 'react-router-dom';

import { Header, Footer } from '@kvenno/shared/components';

import { ChemistryHub } from './pages/ChemistryHub';
import { Home } from './pages/Home';
import { YearHub } from './pages/YearHub';

export function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[200] focus:bg-kvenno-orange focus:text-white focus:p-3"
      >
        Fara beint í efni
      </a>
      <Header />
      <main id="main-content" className="flex-1 max-w-[1200px] mx-auto w-full px-8 py-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/efnafraedi" element={<ChemistryHub />} />
          <Route path="/efnafraedi/1-ar" element={<YearHub year="1-ar" />} />
          <Route path="/efnafraedi/2-ar" element={<YearHub year="2-ar" />} />
          <Route path="/efnafraedi/3-ar" element={<YearHub year="3-ar" />} />
          <Route path="/efnafraedi/val" element={<YearHub year="val" />} />
          <Route path="/efnafraedi/f-bekkir" element={<YearHub year="f-bekkir" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

