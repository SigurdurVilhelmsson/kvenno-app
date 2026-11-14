import type { Equilibrium, Stress } from '../types';

/**
 * The third hint tier, «Aðferð»: how to decide, never which way it shifts.
 *
 * Until 2026-11-14 this tier ended every stress with the answer ("Hliðrun til
 * hægri (færri mól)", "Kerfið eyðir því → hliðrun til vinstri"), while only the
 * fourth tier counted as giving it away (decision item 1). Now only the solution
 * tier names a direction, and `hints.test.ts` holds that for every stress the
 * game offers.
 */
export function methodHint(eq: Equilibrium, stress: Stress): string {
  const reactantGas = eq.gasMoles?.reactants || 0;
  const productGas = eq.gasMoles?.products || 0;
  let method = '';
  const isExothermic = eq.thermodynamics.type === 'exothermic';
  if (stress.type === 'increase-temp' || stress.type === 'decrease-temp') {
    const change =
      stress.type === 'increase-temp'
        ? 'Hitun bætir varma við þá hlið.'
        : 'Kæling tekur varma af þeirri hlið.';
    method = isExothermic
      ? `Útvermið hvarf: skrifaðu varma sem myndefni, hægra megin í jöfnunni. ${change} Hvert hliðrast kerfið til að vega upp á móti?`
      : `Innvermið hvarf: skrifaðu varma sem hvarfefni, vinstra megin í jöfnunni. ${change} Hvert hliðrast kerfið til að vega upp á móti?`;
  } else if (stress.type === 'increase-pressure' || stress.type === 'decrease-pressure') {
    const fewerOrMore = stress.type === 'increase-pressure' ? 'færri' : 'fleiri';
    method = `Teldu mól gass hvorum megin: hvarfefni ${reactantGas}, myndefni ${productGas}. Hvor hliðin hefur ${fewerOrMore} mól gass, eða eru þær jafnar?`;
  } else if (stress.type === 'add-catalyst') {
    method =
      'Hvati lækkar virkjunarorku fram- og bakhvarfs jafn mikið. Breytir það K, eða aðeins því hve fljótt jafnvægi næst?';
  } else if (stress.type === 'add-reactant') {
    method = `Hvarfefninu ${stress.target} var bætt við. Það stendur vinstra megin í jöfnunni. Hvort hvarfið, fram eða bak, eyðir hluta af því?`;
  } else if (stress.type === 'remove-reactant') {
    method = `Hvarfefnið ${stress.target} var fjarlægt. Það stendur vinstra megin í jöfnunni. Hvort hvarfið, fram eða bak, myndar meira af því?`;
  } else if (stress.type === 'add-product') {
    method = `Myndefninu ${stress.target} var bætt við. Það stendur hægra megin í jöfnunni. Hvort hvarfið, fram eða bak, eyðir hluta af því?`;
  } else if (stress.type === 'remove-product') {
    method = `Myndefnið ${stress.target} var fjarlægt. Það stendur hægra megin í jöfnunni. Hvort hvarfið, fram eða bak, myndar meira af því?`;
  }
  return method;
}
