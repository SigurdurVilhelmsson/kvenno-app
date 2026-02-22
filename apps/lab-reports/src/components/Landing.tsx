import React, { useState } from 'react';

import { GraduationCap, BookOpen, ArrowLeft, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Breadcrumbs } from '@kvenno/shared/components/Breadcrumbs';
import { Header } from '@kvenno/shared/components/Header';

import { AuthButton } from './AuthButton';
import { getBreadcrumbsForPath } from '../utils/breadcrumbs';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const basePath = import.meta.env.VITE_BASE_PATH || '/lab-reports';
  const breadcrumbs = getBreadcrumbsForPath(basePath);

  // Extract year from base path for back navigation
  const yearMatch = basePath.match(/\/(\d)-ar\//);
  const backPath = yearMatch ? `/efnafraedi/${yearMatch[1]}-ar/` : '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-100">
      <Header
        activeTrack="efnafraedi"
        authSlot={<AuthButton />}
        onInfoClick={() => setShowInfo(!showInfo)}
      />

      <div className="max-w-4xl mx-auto p-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Back button */}
        <a
          href={backPath}
          className="inline-flex items-center gap-2 mb-6 text-warm-700 hover:text-kvenno-orange transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Til baka</span>
        </a>

        <div className="bg-surface-raised rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold font-heading text-warm-900 mb-2 text-center">
            Tilraunarskýrslur
          </h1>
          <p className="text-warm-600 text-center mb-8">
            AI-aðstoð við mat og skrif efnafræðiskýrslna
          </p>

          {/* Info panel */}
          {showInfo && (
            <div className="mb-6 p-4 bg-orange-50 border border-kvenno-orange rounded-lg">
              <h3 className="font-bold text-warm-900 mb-2">Um verkfærið</h3>
              <p className="text-sm text-warm-700 mb-2">
                Þetta verkfæri notar gervigreind (Claude AI) til að meta tilraunarskýrslur í
                efnafræði og veita ítarlega endurgjöf.
              </p>
              <ul className="text-sm text-warm-700 space-y-1 list-disc list-inside">
                <li>
                  <strong>Kennarar:</strong> Geta metið margar skýrslur í einu og flutt út
                  niðurstöður
                </li>
                <li>
                  <strong>Nemendur:</strong> Fá ítarlega endurgjöf með tillögum til úrbóta
                </li>
                <li>Styður Word (.docx), PDF og myndir</li>
                <li>Öll gögn eru vistuð í vafranum þínum</li>
              </ul>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Teacher Mode (3rd year) */}
            <button
              onClick={() => navigate('/teacher')}
              className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-kvenno-orange rounded-lg p-8 transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-kvenno-orange text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap size={48} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-warm-900 mb-2">Kennari</h2>
                <p className="text-warm-700 mb-4">Hraðmat á mörgum skýrslum samtímis</p>
                <ul className="text-sm text-warm-600 space-y-1 text-left">
                  <li>• Greiningar á mörgum skýrslum í einu</li>
                  <li>• Flytja út niðurstöður í CSV</li>
                  <li>• Vista greiningarlotur</li>
                  <li>• Skoða fyrri greiningar</li>
                </ul>
              </div>
            </button>

            {/* Teacher Mode - 2nd year checklist */}
            <button
              onClick={() => navigate('/teacher-2ar')}
              className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-500 rounded-lg p-8 transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-500 text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <ClipboardCheck size={48} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-warm-900 mb-2">
                  2. ár - Gátlisti
                </h2>
                <p className="text-warm-700 mb-4">Einfaldað gátlistamat fyrir 2. ár</p>
                <ul className="text-sm text-warm-600 space-y-1 text-left">
                  <li>• Til staðar / vantar athugun</li>
                  <li>• Samanburður við drög</li>
                  <li>• Kennari gefur stig handvirkt</li>
                  <li>• Flytja út CSV</li>
                </ul>
              </div>
            </button>

            {/* Student Mode */}
            <button
              onClick={() => navigate('/student')}
              className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-kvenno-orange rounded-lg p-8 transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-kvenno-orange text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={48} />
                </div>
                <h2 className="text-2xl font-bold font-heading text-warm-900 mb-2">Nemandi</h2>
                <p className="text-warm-700 mb-4">Fáðu ítarlega endurgjöf á skýrsluna þína</p>
                <ul className="text-sm text-warm-600 space-y-1 text-left">
                  <li>• Skoða vinnuseðil fyrir tilraunina</li>
                  <li>• Fá ítarlega endurgjöf með stigum</li>
                  <li>• Læra af tillögum og athugasemdum</li>
                  <li>• Senda inn aftur til að bæta</li>
                </ul>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-warm-500">
            <p>Veldu hlutverk til að halda áfram</p>
          </div>
        </div>
      </div>
    </div>
  );
};
