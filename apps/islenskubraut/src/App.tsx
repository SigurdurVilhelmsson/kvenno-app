import { Routes, Route } from 'react-router-dom';

import { Header, Footer, BottomNav } from '@kvenno/shared/components';

import { Home } from './pages/Home';
import { SpjaldPage } from './pages/SpjaldPage';

export function App() {
  return (
    <div className="min-h-screen bg-surface-page text-warm-900 antialiased">
      <Header
        title="Námsvefur Kvennó"
        activeTrack="islenskubraut"
      />

      <main className="pb-[72px] md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
        </Routes>
      </main>

      <Footer
        department="Íslenskubraut"
        subtitle="Verkfæri fyrir kennara í íslenskunámi innflytjenda og flóttamanna"
      />
      <BottomNav activeTab="islenskubraut" />
    </div>
  );
}
