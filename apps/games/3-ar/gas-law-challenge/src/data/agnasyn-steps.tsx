import type { ReactNode } from 'react';

import type { SceneKind } from '../engine/agnasyn';

/**
 * The scenes of this game's Agnasýn, as data (docs/particle-view-template.md).
 * Every number on screen is computed in `engine/agnasyn.ts`.
 */

export interface Step {
  kind: SceneKind;
  title: string;
  /** What the student does, as the control's label says it. */
  action: string;
  equations: string[];
  body: ReactNode;
}

export const STEPS: Step[] = [
  {
    kind: 'boyle',
    title: 'Lögmál Boyles',
    action: 'Ýttu stimplinum',
    equations: ['P₁V₁ = P₂V₂', 'T og n eru föst'],
    body: (
      <>
        <p>
          Hitastigið er fast, svo agnirnar hreyfast jafnhratt allan tímann og hver árekstur á
          stimpilinn er jafnfastur. Þegar rúmmálið minnkar verður styttra á milli árekstra, svo þeir
          verða fleiri á sekúndu.
        </p>
        <p>
          Helmingaðu rúmmálið og árekstrunum fjölgar tvöfalt, og þrýstingurinn tvöfaldast. P og V
          eru í andhverfu hlutfalli.
        </p>
      </>
    ),
  },
  {
    kind: 'charles',
    title: 'Lögmál Charles',
    action: 'Hitaðu eða kældu gasið',
    equations: ['V₁/T₁ = V₂/T₂', 'P og n eru föst'],
    body: (
      <>
        <p>
          Stimpillinn er laus og lóðið ofan á honum heldur þrýstingnum í 1,00 atm. Þegar gasið
          hitnar hreyfast agnirnar hraðar og rekast oftar og fastar á stimpilinn, svo hann lyftist
          þar til árekstrarnir dreifast nóg til að þrýstingurinn sé aftur sá sami. Í nýju stöðunni
          eru árekstrarnir færri á sekúndu en hver þeirra fastari, og margfeldið er aftur 1,00.
        </p>
        <p>
          Línuritið sýnir rúmmálið á móti hitastiginu í °C. Framlengd hittir línan V = 0 við
          −273,15&nbsp;°C, alkul. Þess vegna er T alltaf í kelvinum í gaslögmálunum: þá er V í beinu
          hlutfalli við T.
        </p>
      </>
    ),
  },
  {
    kind: 'gayLussac',
    title: 'Lögmál Gay-Lussac',
    action: 'Hitaðu eða kældu gasið',
    equations: ['P₁/T₁ = P₂/T₂', 'V og n eru föst'],
    body: (
      <>
        <p>
          Nú er stimpillinn læstur, svo rúmmálið breytist ekki. Hraðari agnir rekast bæði oftar og
          fastar á hann, og þrýstingurinn hækkar.
        </p>
        <p>
          Súlurnar sýna hvort tveggja: árekstrum fjölgar eins og √T og hvert högg verður fastara
          eins og √T, svo þrýstingurinn fylgir T í kelvinum. Þess vegna getur lokaður kútur sprungið
          í eldi.
        </p>
      </>
    ),
  },
  {
    kind: 'avogadro',
    title: 'Lögmál Avogadros',
    action: 'Bættu gasi við eða hleyptu því út',
    equations: ['V₁/n₁ = V₂/n₂', 'P og T eru föst'],
    body: (
      <>
        <p>
          Fleiri agnir rekast oftar á stimpilinn, svo hann lyftist þar til hver fermetri hans verður
          aftur fyrir jafnmörgum árekstrum og áður. Agnirnar hreyfast jafnhratt, því hitastigið er
          fast.
        </p>
        <p>
          Rúmmálið fylgir mólfjöldanum, hvaða gas sem er: við sama þrýsting og hitastig hefur eitt
          mól af hvaða gasi sem er sama rúmmál.
        </p>
      </>
    ),
  },
];
