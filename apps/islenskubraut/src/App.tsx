import { lazy, Suspense, useLayoutEffect, type ComponentType } from 'react';

import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';

import { Header, Footer, BottomNav } from '@kvenno/shared/components';

import { Home } from './pages/Home';
import { SmidurListi } from './pages/SmidurListi';
import { SpjaldPage } from './pages/SpjaldPage';

const RELOADED = 'islenskubraut-endurhlodid';

/**
 * A page in a chunk of its own. A tab left open across a deploy asks for a chunk name the deploy
 * removed, and the failed import would blank the whole app; reload once instead, which fetches
 * the new names. A review in progress is in localStorage and survives it.
 */
function lazyPage(load: () => Promise<ComponentType>) {
  return lazy(() =>
    load()
      .then((page) => ({ default: page }))
      .catch((error: unknown) => {
        try {
          const last = Number(window.sessionStorage.getItem(RELOADED) ?? 0);
          if (Date.now() - last > 30_000) {
            window.sessionStorage.setItem(RELOADED, String(Date.now()));
            window.location.reload();
            return new Promise<never>(() => {});
          }
        } catch {
          // No session storage: fall through, rather than risk reloading for ever.
        }
        throw error;
      })
  );
}

// Its sentences are a large generated module, so they load only when the page is opened.
const SmidurPage = lazyPage(() => import('./pages/SmidurPage').then((m) => m.SmidurPage));
// The teachers' review pages, which carry every recording's data; a student never loads them.
const Yfirferd = lazyPage(() => import('./pages/Yfirferd').then((m) => m.Yfirferd));
const YfirferdHljod = lazyPage(() => import('./pages/YfirferdHljod').then((m) => m.YfirferdHljod));

/**
 * A page opened from another opens at its top, not at the scroll position of the long page it was
 * opened from. Only on a link (PUSH, REPLACE): a reload, a restored tab and back/forward are POP,
 * and there the browser puts the reader back where they were.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const type = useNavigationType();
  useLayoutEffect(() => {
    if (type !== 'POP') window.scrollTo(0, 0);
    // Only a new page moves it: the type alone changing is not a navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}

const loading = <p className="py-16 text-center text-warm-600">Sæki…</p>;

export function App() {
  return (
    <div className="min-h-screen bg-surface-page text-warm-900 antialiased">
      <ScrollToTop />
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
              <Suspense fallback={loading}>
                <SmidurPage />
              </Suspense>
            }
          />
          {/* Everything awaiting a teacher, and every recording. No page a student sees links here. */}
          <Route
            path="/yfirferd"
            element={
              <Suspense fallback={loading}>
                <Yfirferd />
              </Suspense>
            }
          />
          <Route
            path="/yfirferd/hljod"
            element={
              <Suspense fallback={loading}>
                <YfirferdHljod />
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
