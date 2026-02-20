import { Routes, Route } from 'react-router-dom';

import { Header, Footer } from '@kvenno/shared/components';

import { Home } from './pages/Home';
import { SpjaldPage } from './pages/SpjaldPage';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Header
        variant="islenskubraut"
        title="Íslenskubraut"
        subtitle="Kennsluspjöld"
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/spjald/:flokkur" element={<SpjaldPage />} />
        </Routes>
      </main>

      <Footer
        variant="islenskubraut"
        subtitle="Verkfæri fyrir kennara í íslenskunámi innflytjenda og flóttamanna"
      />
    </div>
  );
}
