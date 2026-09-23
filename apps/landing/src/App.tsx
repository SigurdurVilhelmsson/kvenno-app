import { Routes, Route, useLocation } from 'react-router-dom';

import {
  Header,
  Footer,
  SkipLink,
  Container,
  PageBackground,
  BottomNav,
} from '@kvenno/shared/components';

import { ChemistryHub } from './pages/ChemistryHub';
import { GamesHub } from './pages/GamesHub';
import { Home } from './pages/Home';
import { YearHub } from './pages/YearHub';

export function App() {
  const { pathname } = useLocation();

  return (
    <PageBackground variant="default" className="flex flex-col">
      <SkipLink />
      <Header activeTrack="efnafraedi" />
      {/* No bottom padding for the phone tab bar here: BottomNav reserves its
          own space after the footer, which is what the bar would otherwise cover. */}
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
            <Route path="/efnafraedi/1-ar/games" element={<GamesHub year="1-ar" />} />
            <Route path="/efnafraedi/2-ar/games" element={<GamesHub year="2-ar" />} />
            <Route path="/efnafraedi/3-ar/games" element={<GamesHub year="3-ar" />} />
          </Routes>
        </Container>
      </main>
      <Footer department="Efnafræðideild" />
      <BottomNav activeTab={pathname === '/' ? 'home' : 'efnafraedi'} />
    </PageBackground>
  );
}
