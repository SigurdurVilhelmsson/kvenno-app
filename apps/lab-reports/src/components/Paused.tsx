import React from 'react';

import { ArrowLeft } from 'lucide-react';

import { Breadcrumbs } from '@kvenno/shared/components/Breadcrumbs';
import { Header } from '@kvenno/shared/components/Header';

import { getBreadcrumbsForPath } from '../utils/breadcrumbs';

/** Shown instead of the app while `LAB_REPORTS_PAUSED` is true. */
export const Paused: React.FC = () => {
  const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
  const breadcrumbs = getBreadcrumbsForPath(basePath);
  const yearMatch = basePath.match(/\/(\d)-ar\//);
  const backPath = yearMatch ? `/efnafraedi/${yearMatch[1]}-ar/` : '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      <Header activeTrack="efnafraedi" />

      <main className="max-w-4xl mx-auto p-6">
        <Breadcrumbs items={breadcrumbs} />

        <a
          href={backPath}
          className="inline-flex items-center gap-2 mb-6 text-warm-700 hover:text-kvenno-orange transition"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          <span className="font-medium">Til baka</span>
        </a>

        <div className="bg-surface-raised rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-warm-900 mb-4">
            Tilraunarskýrslur
          </h1>
          <p className="text-lg text-warm-700">
            Verkfærið er í hléi á meðan það er endurgert. Það verður tekið aftur í notkun á næstu
            önn.
          </p>
        </div>
      </main>
    </div>
  );
};
