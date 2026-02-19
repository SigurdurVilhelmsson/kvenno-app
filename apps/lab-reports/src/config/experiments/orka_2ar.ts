import { ExperimentConfig2 } from '@/types';

/**
 * Orka í efnahvörfum (Energy in Chemical Reactions / Enthalpy)
 * 2nd year chemistry experiment - Simplified checklist approach
 *
 * This experiment explores enthalpy changes (∆H) by measuring
 * heat released/absorbed during dissolution of NaOH and NH₄NO₃.
 *
 * GRADING PHILOSOPHY:
 * - AI performs BINARY checks only (present/missing)
 * - Teacher assigns points manually based on checklist results
 * - No AI-assigned points (reduces error)
 */
export const orka_2ar: ExperimentConfig2 = {
  id: 'orka-2ar',
  title: 'Orka í efnahvörfum (∆H)',
  year: 2,

  baselineComparison: {
    enabled: true,
    requiredConcepts: [
      'hvarfvarmi', 'enthalpy', '∆H',
      'innvermin', 'endothermic',
      'útvermin', 'exothermic',
      'orkubreyting', 'energy change',
    ],
    requiredFormulas: [
      'q = C', 'q=C',
      '∆H', 'ΔH',
    ],
  },

  checklist: {
    uppsetning: {
      name: 'Uppsetning kafla',
      weight: '10%',
      items: [
        { id: 'tilgangur', label: 'Tilgangur til staðar', autoCheck: true },
        { id: 'fraedikafli', label: 'Fræðikafli til staðar', autoCheck: true },
        { id: 'taeki_efni', label: 'Tæki og efni til staðar', autoCheck: true },
        { id: 'framkvamd', label: 'Framkvæmd til staðar', autoCheck: true },
        { id: 'nidurstodur', label: 'Niðurstöður til staðar', autoCheck: true },
        { id: 'umraedur', label: 'Umræður/Lokaorð til staðar', autoCheck: true },
      ],
      penalty: '2% dregin frá fyrir hvern kafla sem vantar',
    },

    framkvamd: {
      name: 'Framkvæmd',
      weight: '5%',
      items: [
        { id: 'visad_vinnusedil', label: 'Vísað í vinnuseðil með nafni', autoCheck: true },
      ],
    },

    nidurstodur_hluti1: {
      name: 'Niðurstöður - Hluti 1 (Handhitapoki)',
      weight: 'Part of 15%',
      items: [
        { id: 'efnajafna', label: 'Stillta efnajafna til staðar', autoCheck: true },
        { id: 'hvarfvarmi_utreikningur', label: 'Útreikningur á ∆H (hvarfvarma)', autoCheck: true },
        { id: 'innihaldsefni_listi', label: 'Listi af innihaldsefnum og hlutverkum', autoCheck: true },
      ],
    },

    nidurstodur_hluti2: {
      name: 'Niðurstöður - Hluti 2 (NaOH og NH₄NO₃)',
      weight: 'Part of 15%',
      items: [
        { id: 'tafla', label: 'Tafla með mældum niðurstöðum', autoCheck: true },
        { id: 'naoh_q', label: 'NaOH útreikningar: qlausn, qgler, qheild', autoCheck: true },
        { id: 'nh4no3_q', label: 'NH₄NO₃ útreikningar: qlausn, qgler, qheild', autoCheck: true },
        { id: 'molarleysnivarmi', label: 'Mólarleysnivarmi reiknað (báðar)', autoCheck: true },
        { id: 'prosentumunur', label: 'Prósentumunur frá viðurkenndu gildi', autoCheck: true },
        { id: 'einingar', label: 'Einingar á útreikningum', autoCheck: true },
      ],
    },

    umraedur: {
      name: 'Umræður og ályktanir',
      weight: '10%',
      items: [
        { id: 'hluti1_umraeda', label: 'Hluti 1 ræddur (hvarfefni, myndefni, ∆H)', autoCheck: true },
        { id: 'hluti2_umraeda', label: 'Hluti 2 ræddur (samanburður við viðurkennd gildi)', autoCheck: true },
        { id: 'naoh_utvermid', label: 'NaOH merkt sem útvermið (exothermic)', autoCheck: true },
        { id: 'nh4no3_innvermid', label: 'NH₄NO₃ merkt sem innvermið (endothermic)', autoCheck: true },
        { id: 'skekkjur', label: 'Skekkjur/óvissa rædd', autoCheck: true },
        { id: 'tenging_fraedi', label: 'Niðurstöður tengdar fræðikafla', autoCheck: true },
      ],
    },

    fragangur: {
      name: 'Frágangur',
      weight: '10%',
      items: [
        { id: 'header_info', label: 'Dagsetning, heiti, nafn, samstarfsfólk', autoCheck: true },
        { id: 'einingar_allt', label: 'Einingar á öllum gildum', autoCheck: true },
        { id: 'jofnur_ser_linum', label: 'Jöfnur og útreikningar í sér línum', autoCheck: false, manualRequired: true },
        { id: 'samraemi', label: 'Samræmi (leturgerð, uppsetning)', autoCheck: false, manualRequired: true },
        { id: 'undirskrift', label: 'Undirskrift til staðar', autoCheck: true },
      ],
    },
  },

  alwaysManualCheck: [
    'Réttmæti útreikninga (AI getur ekki reiknað)',
    'Samræmi í leturgerð og uppsetningu',
    'Jöfnur og útreikningar í sér línum',
  ],
};
