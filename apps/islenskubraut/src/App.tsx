import { lazy, Suspense } from 'react';

import { Routes, Route } from 'react-router-dom';

import { Header, Footer, BottomNav } from '@kvenno/shared/components';

import { Home } from './pages/Home';
import { SmidurListi } from './pages/SmidurListi';
import { SpjaldPage } from './pages/SpjaldPage';

// Its sentences are a large generated module, so they load only when the page is opened.
const SmidurPage = lazy(() =>
  import('./pages/SmidurPage').then((m) => ({ default: m.SmidurPage }))
);

export function App() {
  return (
    <div className="min-h-screen bg-surface-page text-warm-900 antialiased">
      <Header title="Námsvefur Kvennó" activeTrack="islenskubraut" />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
          {/* Every builder, drafts included, for a teacher. Deliberately linked from nowhere. */}
          <Route path="/smidur" element={<SmidurListi />} />
          <Route
            path="/smidur/:flokkur"
            element={
              <Suspense fallback={<p className="py-16 text-center text-warm-600">Sæki…</p>}>
                <SmidurPage />
              </Suspense>
            }
          />
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
