import { Routes, Route } from 'react-router-dom';

import { Header, Footer, SkipLink, Container, PageBackground } from '@kvenno/shared/components';

import { ChemistryHub } from './pages/ChemistryHub';
import { Home } from './pages/Home';
import { YearHub } from './pages/YearHub';

export function App() {
  return (
    <PageBackground variant="default" className="flex flex-col">
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1 py-0">
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/efnafraedi" element={<ChemistryHub />} />
            <Route path="/efnafraedi/1-ar" element={<YearHub year="1-ar" />} />
            <Route path="/efnafraedi/2-ar" element={<YearHub year="2-ar" />} />
            <Route path="/efnafraedi/3-ar" element={<YearHub year="3-ar" />} />
            <Route path="/efnafraedi/val" element={<YearHub year="val" />} />
            <Route path="/efnafraedi/f-bekkir" element={<YearHub year="f-bekkir" />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </PageBackground>
  );
}
