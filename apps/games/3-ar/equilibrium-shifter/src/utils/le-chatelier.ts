/**
 * Le Chatelier's Principle Logic Engine
 *
 * This is the CORE of the game - must be 100% accurate!
 *
 * Le Chatelier's Principle: When a stress is applied to a system at equilibrium,
 * the system shifts to relieve that stress.
 */

import { formatDecimal } from '@shared/utils';

import { Equilibrium, Stress, ShiftResult, ShiftDirection } from '../types';

/**
 * Calculate the equilibrium shift based on applied stress
 *
 * Every Icelandic string here is what the student reads: `explanationIs`,
 * `reasoningIs` and `molecularViewIs`. The English fields serve only the
 * English language option. The Icelandic reasoning and molecular view were
 * missing until 2026-09-23, so the Icelandic screen showed the English ones.
 *
 * @param equilibrium - The equilibrium system
 * @param stress - The applied stress
 * @returns ShiftResult with direction and explanations
 */
export const calculateShift = (equilibrium: Equilibrium, stress: Stress): ShiftResult => {
  const { type, target } = stress;
  const { thermodynamics, gasMoles } = equilibrium;
  // Decimal comma and the Icelandic unit, as the numbers panel prints it.
  const deltaHIs = `ΔH = ${formatDecimal(thermodynamics.deltaH)} kJ/mól`;

  let direction: ShiftDirection = 'none';
  let explanation = '';
  let explanationIs = '';
  let reasoning: string[] = [];
  let reasoningIs: string[] = [];
  let molecularView = '';
  let molecularViewIs = '';

  // ==================== CONCENTRATION CHANGES ====================
  if (type === 'add-reactant') {
    direction = 'right';
    const reactantFormula = target || '';
    explanation = `Adding ${reactantFormula} (a reactant) increases reactant concentration. The system shifts RIGHT to consume the added ${reactantFormula} and produce more products.`;
    explanationIs = `Að bæta við ${reactantFormula} (hvarfefni) eykur styrk hvarfefna. Kerfið hliðrast TIL HÆGRI til að neyta ${reactantFormula} og framleiða meira af myndefnum.`;
    reasoning = [
      "Le Chatelier's Principle: System shifts to relieve stress",
      `Stress: Increased [${reactantFormula}]`,
      'System response: Shift RIGHT (→) toward products',
      'This consumes excess reactant and establishes new equilibrium',
    ];
    reasoningIs = [
      'Le Chatelier: Kerfið hliðrast þannig að það dragi úr álaginu',
      `Álag: [${reactantFormula}] eykst`,
      'Viðbragð kerfisins: Hliðrun TIL HÆGRI (→), í átt að myndefnum',
      'Við það eyðist hluti viðbætta hvarfefnisins og nýtt jafnvægi næst',
    ];
    molecularView = `More ${reactantFormula} molecules → Increased collision frequency → Forward reaction favored → Product concentration increases`;
    molecularViewIs = `Meira af ${reactantFormula} → tíðari árekstrar → framhvarfið hefur yfirhöndina → styrkur myndefna eykst`;
  } else if (type === 'add-product') {
    direction = 'left';
    const productFormula = target || '';
    explanation = `Adding ${productFormula} (a product) increases product concentration. The system shifts LEFT to consume the added ${productFormula} and produce more reactants.`;
    explanationIs = `Að bæta við ${productFormula} (myndefni) eykur styrk myndefna. Kerfið hliðrast TIL VINSTRI til að neyta ${productFormula} og framleiða meira af hvarfefnum.`;
    reasoning = [
      "Le Chatelier's Principle: System shifts to relieve stress",
      `Stress: Increased [${productFormula}]`,
      'System response: Shift LEFT (←) toward reactants',
      'This consumes excess product and establishes new equilibrium',
    ];
    reasoningIs = [
      'Le Chatelier: Kerfið hliðrast þannig að það dragi úr álaginu',
      `Álag: [${productFormula}] eykst`,
      'Viðbragð kerfisins: Hliðrun TIL VINSTRI (←), í átt að hvarfefnum',
      'Við það eyðist hluti viðbætta myndefnisins og nýtt jafnvægi næst',
    ];
    molecularView = `More ${productFormula} molecules → Reverse reaction favored → Reactant concentration increases`;
    molecularViewIs = `Meira af ${productFormula} → bakhvarfið hefur yfirhöndina → styrkur hvarfefna eykst`;
  } else if (type === 'remove-reactant') {
    direction = 'left';
    const reactantFormula = target || '';
    explanation = `Removing ${reactantFormula} (a reactant) decreases reactant concentration. The system shifts LEFT to produce more ${reactantFormula} from products.`;
    explanationIs = `Að fjarlægja ${reactantFormula} (hvarfefni) minnkar styrk hvarfefna. Kerfið hliðrast TIL VINSTRI til að framleiða meira af ${reactantFormula}.`;
    reasoning = [
      "Le Chatelier's Principle: System shifts to relieve stress",
      `Stress: Decreased [${reactantFormula}]`,
      'System response: Shift LEFT (←) toward reactants',
      'This replaces the removed reactant',
    ];
    reasoningIs = [
      'Le Chatelier: Kerfið hliðrast þannig að það dragi úr álaginu',
      `Álag: [${reactantFormula}] minnkar`,
      'Viðbragð kerfisins: Hliðrun TIL VINSTRI (←), í átt að hvarfefnum',
      'Við það myndast aftur hluti hvarfefnisins sem var fjarlægt',
    ];
    molecularView = `Fewer ${reactantFormula} molecules → Reverse reaction favored → System tries to restore ${reactantFormula}`;
    molecularViewIs = `Minna af ${reactantFormula} → bakhvarfið hefur yfirhöndina → kerfið myndar aftur hluta af ${reactantFormula}`;
  } else if (type === 'remove-product') {
    direction = 'right';
    const productFormula = target || '';
    explanation = `Removing ${productFormula} (a product) decreases product concentration. The system shifts RIGHT to produce more ${productFormula} from reactants.`;
    explanationIs = `Að fjarlægja ${productFormula} (myndefni) minnkar styrk myndefna. Kerfið hliðrast TIL HÆGRI til að framleiða meira af ${productFormula}.`;
    reasoning = [
      "Le Chatelier's Principle: System shifts to relieve stress",
      `Stress: Decreased [${productFormula}]`,
      'System response: Shift RIGHT (→) toward products',
      'This replaces the removed product',
    ];
    reasoningIs = [
      'Le Chatelier: Kerfið hliðrast þannig að það dragi úr álaginu',
      `Álag: [${productFormula}] minnkar`,
      'Viðbragð kerfisins: Hliðrun TIL HÆGRI (→), í átt að myndefnum',
      'Við það myndast aftur hluti myndefnisins sem var fjarlægt',
    ];
    molecularView = `Fewer ${productFormula} molecules → Forward reaction favored → System produces more ${productFormula}`;
    molecularViewIs = `Minna af ${productFormula} → framhvarfið hefur yfirhöndina → kerfið myndar meira af ${productFormula}`;
  }

  // ==================== TEMPERATURE CHANGES ====================
  else if (type === 'increase-temp') {
    if (thermodynamics.type === 'endothermic') {
      // Endothermic (ΔH > 0): Heat is a REACTANT
      direction = 'right';
      explanation = `This reaction is ENDOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol > 0), so heat is a reactant. Increasing temperature is like adding a reactant. The system shifts RIGHT to consume the added heat.`;
      explanationIs = `Þetta hvarf er INNVERMIÐ (${deltaHIs} > 0), svo varmi er hvarfefni. Að auka hitastig er eins og að bæta við hvarfefni. Kerfið hliðrast TIL HÆGRI til að neyta varmans.`;
      reasoning = [
        'Endothermic reaction: Heat is absorbed (heat is a reactant)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol > 0`,
        'Increasing T is like adding a reactant',
        'System shifts RIGHT (→) to consume heat energy',
      ];
      reasoningIs = [
        'Innvermið hvarf: Það tekur til sín varma (varmi er hvarfefni)',
        `${deltaHIs} > 0`,
        'Að auka hitastig er eins og að bæta við hvarfefni',
        'Kerfið hliðrast TIL HÆGRI (→) til að neyta varmans',
      ];
      molecularView =
        'Higher temperature → More kinetic energy → Endothermic (forward) reaction favored → Products increase';
      molecularViewIs =
        'Hærra hitastig → meiri hreyfiorka → framhvarfið, sem tekur til sín varma, hefur yfirhöndina → meira myndast af myndefnum';
    } else {
      // Exothermic (ΔH < 0): Heat is a PRODUCT
      direction = 'left';
      explanation = `This reaction is EXOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol < 0), so heat is a product. Increasing temperature is like adding a product. The system shifts LEFT to consume the added heat.`;
      explanationIs = `Þetta hvarf er ÚTVERMIÐ (${deltaHIs} < 0), svo varmi er myndefni. Að auka hitastig er eins og að bæta við myndefni. Kerfið hliðrast TIL VINSTRI til að neyta varmans.`;
      reasoning = [
        'Exothermic reaction: Heat is released (heat is a product)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol < 0`,
        'Increasing T is like adding a product',
        'System shifts LEFT (←) to consume heat energy',
      ];
      reasoningIs = [
        'Útvermið hvarf: Það losar varma (varmi er myndefni)',
        `${deltaHIs} < 0`,
        'Að auka hitastig er eins og að bæta við myndefni',
        'Kerfið hliðrast TIL VINSTRI (←) til að neyta varmans',
      ];
      molecularView =
        'Higher temperature → Excess heat energy → Reverse (endothermic) direction favored → Reactants increase';
      molecularViewIs =
        'Hærra hitastig → meiri varmi í kerfinu → bakhvarfið, sem tekur til sín varma, hefur yfirhöndina → meira myndast af hvarfefnum';
    }
  } else if (type === 'decrease-temp') {
    if (thermodynamics.type === 'endothermic') {
      // Endothermic (ΔH > 0): Heat is a REACTANT
      direction = 'left';
      explanation = `This reaction is ENDOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol > 0), so heat is a reactant. Decreasing temperature is like removing a reactant. The system shifts LEFT to produce more heat (and reactants).`;
      explanationIs = `Þetta hvarf er INNVERMIÐ (${deltaHIs} > 0), svo varmi er hvarfefni. Að minnka hitastig er eins og að fjarlægja hvarfefni. Kerfið hliðrast TIL VINSTRI.`;
      reasoning = [
        'Endothermic reaction: Heat is absorbed (heat is a reactant)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol > 0`,
        'Decreasing T is like removing a reactant',
        'System shifts LEFT (←) toward reverse (exothermic) direction',
      ];
      reasoningIs = [
        'Innvermið hvarf: Það tekur til sín varma (varmi er hvarfefni)',
        `${deltaHIs} > 0`,
        'Að minnka hitastig er eins og að fjarlægja hvarfefni',
        'Kerfið hliðrast TIL VINSTRI (←): bakhvarfið losar varma',
      ];
      molecularView =
        'Lower temperature → Less energy available → Reverse reaction favored → Heat is released';
      molecularViewIs =
        'Lægra hitastig → minni orka tiltæk → bakhvarfið hefur yfirhöndina → varmi losnar';
    } else {
      // Exothermic (ΔH < 0): Heat is a PRODUCT
      direction = 'right';
      explanation = `This reaction is EXOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol < 0), so heat is a product. Decreasing temperature is like removing a product. The system shifts RIGHT to produce more heat (and products).`;
      explanationIs = `Þetta hvarf er ÚTVERMIÐ (${deltaHIs} < 0), svo varmi er myndefni. Að minnka hitastig er eins og að fjarlægja myndefni. Kerfið hliðrast TIL HÆGRI.`;
      reasoning = [
        'Exothermic reaction: Heat is released (heat is a product)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol < 0`,
        'Decreasing T is like removing a product',
        'System shifts RIGHT (→) to release heat energy',
      ];
      reasoningIs = [
        'Útvermið hvarf: Það losar varma (varmi er myndefni)',
        `${deltaHIs} < 0`,
        'Að minnka hitastig er eins og að fjarlægja myndefni',
        'Kerfið hliðrast TIL HÆGRI (→) og losar varma',
      ];
      molecularView =
        'Lower temperature → System produces heat → Forward (exothermic) reaction favored → Products increase';
      molecularViewIs =
        'Lægra hitastig → kerfið myndar varma → framhvarfið, sem losar varma, hefur yfirhöndina → meira myndast af myndefnum';
    }
  }

  // ==================== PRESSURE CHANGES (GAS ONLY) ====================
  else if (type === 'increase-pressure') {
    if (gasMoles.reactants === 0 && gasMoles.products === 0) {
      // No gas molecules - pressure has no effect
      direction = 'none';
      explanation =
        'This equilibrium involves only aqueous or solid phases. Pressure changes do NOT affect equilibria without gas molecules. No shift occurs.';
      explanationIs =
        'Þetta jafnvægi inniheldur aðeins vatnslausnir eða föst efni. Þrýstingsbreytingar hafa EKKI áhrif á jafnvægi án gassameinda. Engin hliðrun á sér stað.';
      reasoning = [
        'Pressure affects ONLY gas equilibria',
        'This system has no gas molecules',
        'No shift occurs (Q and K unchanged)',
      ];
      reasoningIs = [
        'Þrýstingur hefur AÐEINS áhrif á jafnvægi þar sem gas kemur við sögu',
        'Í þessu kerfi eru engar gassameindir',
        'Engin hliðrun (Q og K óbreytt)',
      ];
      molecularView = 'Aqueous/solid species - volumes essentially incompressible - no shift';
      molecularViewIs = 'Efni í lausn og föst efni þjappast nánast ekkert saman → engin hliðrun';
    } else if (gasMoles.reactants === gasMoles.products) {
      // Equal moles - no shift
      direction = 'none';
      explanation = `Equal moles of gas: ${gasMoles.reactants} moles reactants ⇌ ${gasMoles.products} moles products. Increasing pressure affects both sides equally. No shift occurs.`;
      explanationIs = `Jafnmörg mól af gasi: ${gasMoles.reactants} mól hvarfefna ⇌ ${gasMoles.products} mól myndefna. Að auka þrýsting hefur jöfn áhrif á báðar hliðar. Engin hliðrun.`;
      reasoning = [
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'Equal moles → pressure affects both sides equally',
        'No shift occurs',
      ];
      reasoningIs = [
        `Gasmól hvarfefna: ${gasMoles.reactants}`,
        `Gasmól myndefna: ${gasMoles.products}`,
        'Jafnmörg gasmól → þrýstingurinn hefur jöfn áhrif á báðar hliðar',
        'Engin hliðrun',
      ];
      molecularView =
        'Same number of gas molecules on each side → pressure increase has no net effect';
      molecularViewIs =
        'Jafnmargar gassameindir hvorum megin → aukinn þrýstingur hefur engin heildaráhrif';
    } else if (gasMoles.reactants > gasMoles.products) {
      // Shift toward fewer moles (products)
      direction = 'right';
      explanation = `Increasing pressure favors the side with FEWER gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts RIGHT toward fewer moles.`;
      explanationIs = `Að auka þrýsting stuðlar að hliðinni með FÆRRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Myndefni: ${gasMoles.products} mól. Kerfið hliðrast TIL HÆGRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts RIGHT (→) toward fewer moles',
      ];
      reasoningIs = [
        'Le Chatelier: Kerfið hliðrast þannig að það dragi úr þrýstingsbreytingunni',
        `Gasmól hvarfefna: ${gasMoles.reactants}`,
        `Gasmól myndefna: ${gasMoles.products}`,
        'Kerfið hliðrast TIL HÆGRI (→), að hliðinni með færri gasmólum',
      ];
      molecularView =
        'Increased pressure → Molecules compressed → System favors side with fewer gas molecules → Products';
      molecularViewIs =
        'Aukinn þrýstingur → sameindunum er þjappað saman → hliðin með færri gassameindum hefur yfirhöndina → myndefnin';
    } else {
      // Shift toward fewer moles (reactants)
      direction = 'left';
      explanation = `Increasing pressure favors the side with FEWER gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts LEFT toward fewer moles.`;
      explanationIs = `Að auka þrýsting stuðlar að hliðinni með FÆRRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Myndefni: ${gasMoles.products} mól. Kerfið hliðrast TIL VINSTRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts LEFT (←) toward fewer moles',
      ];
      reasoningIs = [
        'Le Chatelier: Kerfið hliðrast þannig að það dragi úr þrýstingsbreytingunni',
        `Gasmól hvarfefna: ${gasMoles.reactants}`,
        `Gasmól myndefna: ${gasMoles.products}`,
        'Kerfið hliðrast TIL VINSTRI (←), að hliðinni með færri gasmólum',
      ];
      molecularView =
        'Increased pressure → Molecules compressed → System favors side with fewer gas molecules → Reactants';
      molecularViewIs =
        'Aukinn þrýstingur → sameindunum er þjappað saman → hliðin með færri gassameindum hefur yfirhöndina → hvarfefnin';
    }
  } else if (type === 'decrease-pressure') {
    if (gasMoles.reactants === 0 && gasMoles.products === 0) {
      // No gas molecules - pressure has no effect
      direction = 'none';
      explanation =
        'This equilibrium involves only aqueous or solid phases. Pressure changes do NOT affect equilibria without gas molecules. No shift occurs.';
      explanationIs =
        'Þetta jafnvægi inniheldur aðeins vatnslausnir eða föst efni. Þrýstingsbreytingar hafa EKKI áhrif á jafnvægi án gassameinda. Engin hliðrun.';
      reasoning = [
        'Pressure affects ONLY gas equilibria',
        'This system has no gas molecules',
        'No shift occurs',
      ];
      reasoningIs = [
        'Þrýstingur hefur AÐEINS áhrif á jafnvægi þar sem gas kemur við sögu',
        'Í þessu kerfi eru engar gassameindir',
        'Engin hliðrun',
      ];
      molecularView = 'Aqueous/solid species - volumes essentially incompressible - no shift';
      molecularViewIs = 'Efni í lausn og föst efni þjappast nánast ekkert saman → engin hliðrun';
    } else if (gasMoles.reactants === gasMoles.products) {
      // Equal moles - no shift
      direction = 'none';
      explanation = `Equal moles of gas: ${gasMoles.reactants} moles reactants ⇌ ${gasMoles.products} moles products. Decreasing pressure affects both sides equally. No shift occurs.`;
      explanationIs = `Jafnmörg mól af gasi: ${gasMoles.reactants} mól hvarfefna ⇌ ${gasMoles.products} mól myndefna. Að minnka þrýsting hefur jöfn áhrif á báðar hliðar. Engin hliðrun.`;
      reasoning = [
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'Equal moles → pressure affects both sides equally',
        'No shift occurs',
      ];
      reasoningIs = [
        `Gasmól hvarfefna: ${gasMoles.reactants}`,
        `Gasmól myndefna: ${gasMoles.products}`,
        'Jafnmörg gasmól → þrýstingurinn hefur jöfn áhrif á báðar hliðar',
        'Engin hliðrun',
      ];
      molecularView =
        'Same number of gas molecules on each side → pressure decrease has no net effect';
      molecularViewIs =
        'Jafnmargar gassameindir hvorum megin → minni þrýstingur hefur engin heildaráhrif';
    } else if (gasMoles.reactants > gasMoles.products) {
      // Shift toward more moles (reactants)
      direction = 'left';
      explanation = `Decreasing pressure favors the side with MORE gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts LEFT toward more moles.`;
      explanationIs = `Að minnka þrýsting stuðlar að hliðinni með FLEIRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Myndefni: ${gasMoles.products} mól. Kerfið hliðrast TIL VINSTRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts LEFT (←) toward more moles',
      ];
      reasoningIs = [
        'Le Chatelier: Kerfið hliðrast þannig að það dragi úr þrýstingsbreytingunni',
        `Gasmól hvarfefna: ${gasMoles.reactants}`,
        `Gasmól myndefna: ${gasMoles.products}`,
        'Kerfið hliðrast TIL VINSTRI (←), að hliðinni með fleiri gasmólum',
      ];
      molecularView =
        'Decreased pressure → Volume increases → System favors side with more gas molecules → Reactants';
      molecularViewIs =
        'Minni þrýstingur → rúmmálið eykst → hliðin með fleiri gassameindum hefur yfirhöndina → hvarfefnin';
    } else {
      // Shift toward more moles (products)
      direction = 'right';
      explanation = `Decreasing pressure favors the side with MORE gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts RIGHT toward more moles.`;
      explanationIs = `Að minnka þrýsting stuðlar að hliðinni með FLEIRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Myndefni: ${gasMoles.products} mól. Kerfið hliðrast TIL HÆGRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts RIGHT (→) toward more moles',
      ];
      reasoningIs = [
        'Le Chatelier: Kerfið hliðrast þannig að það dragi úr þrýstingsbreytingunni',
        `Gasmól hvarfefna: ${gasMoles.reactants}`,
        `Gasmól myndefna: ${gasMoles.products}`,
        'Kerfið hliðrast TIL HÆGRI (→), að hliðinni með fleiri gasmólum',
      ];
      molecularView =
        'Decreased pressure → Volume increases → System favors side with more gas molecules → Products';
      molecularViewIs =
        'Minni þrýstingur → rúmmálið eykst → hliðin með fleiri gassameindum hefur yfirhöndina → myndefnin';
    }
  }

  // ==================== CATALYST ====================
  else if (type === 'add-catalyst') {
    direction = 'none';
    explanation =
      'A CATALYST lowers the activation energy for BOTH forward and reverse reactions EQUALLY. The equilibrium constant K is UNCHANGED. The system reaches equilibrium faster, but the final position is the same. NO SHIFT occurs.';
    explanationIs =
      'HVATI lækkar virkjunarorku fyrir BÆÐI framhvarf og bakhvarf JAFNT. Jafnvægisfastinn K er ÓBREYTTUR. Kerfið nær jafnvægi hraðar, en lokastaðan er sú sama. ENGIN HLIÐRUN á sér stað.';
    reasoning = [
      'Catalyst lowers activation energy (Ea) for both directions',
      'Forward rate increases by same factor as reverse rate',
      'K = kforward / kreverse remains unchanged',
      'Equilibrium reached faster, but same final position',
      'NO SHIFT - this is critical to understand!',
    ];
    reasoningIs = [
      'Hvati lækkar virkjunarorkuna (Ea) í báðar áttir',
      'Hraði framhvarfs og bakhvarfs margfaldast með sömu tölu',
      'K = k(framhvarf) / k(bakhvarf) breytist því ekki',
      'Jafnvægi næst fyrr, en lokastaðan er sú sama',
      'ENGIN HLIÐRUN — þetta er lykilatriði!',
    ];
    molecularView =
      'Catalyst provides alternate pathway → Both reactions speed up equally → Same equilibrium position reached faster';
    molecularViewIs =
      'Hvati opnar hvarfinu aðra leið með lægri virkjunarorku → hraði framhvarfs og bakhvarfs eykst jafn mikið → sama jafnvægisstaða næst fyrr';
  }

  return {
    direction,
    explanation,
    explanationIs,
    reasoning,
    reasoningIs,
    molecularView,
    molecularViewIs,
  };
};

/**
 * Helper function to get stress description in Icelandic
 */
export const getStressDescriptionIs = (stress: Stress): string => {
  const { type, target } = stress;

  switch (type) {
    case 'add-reactant':
      return `Bæta við ${target} (hvarfefni)`;
    case 'add-product':
      return `Bæta við ${target} (myndefni)`;
    case 'remove-reactant':
      return `Fjarlægja ${target} (hvarfefni)`;
    case 'remove-product':
      return `Fjarlægja ${target} (myndefni)`;
    case 'increase-temp':
      return `Auka hitastig`;
    case 'decrease-temp':
      return `Lækka hitastig`;
    case 'increase-pressure':
      return `Auka þrýsting`;
    case 'decrease-pressure':
      return `Minnka þrýsting`;
    case 'add-catalyst':
      return `Bæta við hvata`;
    default:
      return 'Óþekkt álag';
  }
};

/**
 * Helper function to get stress description in English
 */
export const getStressDescription = (stress: Stress): string => {
  const { type, target } = stress;

  switch (type) {
    case 'add-reactant':
      return `Add ${target} (reactant)`;
    case 'add-product':
      return `Add ${target} (product)`;
    case 'remove-reactant':
      return `Remove ${target} (reactant)`;
    case 'remove-product':
      return `Remove ${target} (product)`;
    case 'increase-temp':
      return `Increase temperature`;
    case 'decrease-temp':
      return `Decrease temperature`;
    case 'increase-pressure':
      return `Increase pressure`;
    case 'decrease-pressure':
      return `Decrease pressure`;
    case 'add-catalyst':
      return `Add catalyst`;
    default:
      return 'Unknown stress';
  }
};

/**
 * Helper to determine if a molecule is a reactant or product
 */
export const isReactant = (formula: string, equilibrium: Equilibrium): boolean => {
  return equilibrium.reactants.some((r) => r.formula === formula);
};

export const isProduct = (formula: string, equilibrium: Equilibrium): boolean => {
  return equilibrium.products.some((p) => p.formula === formula);
};
