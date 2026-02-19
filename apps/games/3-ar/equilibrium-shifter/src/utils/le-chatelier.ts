/**
 * Le Chatelier's Principle Logic Engine
 *
 * This is the CORE of the game - must be 100% accurate!
 *
 * Le Chatelier's Principle: When a stress is applied to a system at equilibrium,
 * the system shifts to relieve that stress.
 */

import { Equilibrium, Stress, ShiftResult, ShiftDirection } from '../types';

/**
 * Calculate the equilibrium shift based on applied stress
 *
 * @param equilibrium - The equilibrium system
 * @param stress - The applied stress
 * @returns ShiftResult with direction and explanations
 */
export const calculateShift = (equilibrium: Equilibrium, stress: Stress): ShiftResult => {
  const { type, target } = stress;
  const { thermodynamics, gasMoles } = equilibrium;

  let direction: ShiftDirection = 'none';
  let explanation = '';
  let explanationIs = '';
  let reasoning: string[] = [];
  let molecularView = '';

  // ==================== CONCENTRATION CHANGES ====================
  if (type === 'add-reactant') {
    direction = 'right';
    const reactantFormula = target || '';
    explanation = `Adding ${reactantFormula} (a reactant) increases reactant concentration. The system shifts RIGHT to consume the added ${reactantFormula} and produce more products.`;
    explanationIs = `Að bæta við ${reactantFormula} (hvarfefni) eykur styrk hvarfefna. Kerfið hliðrast TIL HÆGRI til að neyta ${reactantFormula} og framleiða meira af afurðum.`;
    reasoning = [
      'Le Chatelier\'s Principle: System shifts to relieve stress',
      `Stress: Increased [${reactantFormula}]`,
      'System response: Shift RIGHT (→) toward products',
      'This consumes excess reactant and establishes new equilibrium'
    ];
    molecularView = `More ${reactantFormula} molecules → Increased collision frequency → Forward reaction favored → Product concentration increases`;
  }

  else if (type === 'add-product') {
    direction = 'left';
    const productFormula = target || '';
    explanation = `Adding ${productFormula} (a product) increases product concentration. The system shifts LEFT to consume the added ${productFormula} and produce more reactants.`;
    explanationIs = `Að bæta við ${productFormula} (afurð) eykur styrk afurða. Kerfið hliðrast TIL VINSTRI til að neyta ${productFormula} og framleiða meira af hvarfefnum.`;
    reasoning = [
      'Le Chatelier\'s Principle: System shifts to relieve stress',
      `Stress: Increased [${productFormula}]`,
      'System response: Shift LEFT (←) toward reactants',
      'This consumes excess product and establishes new equilibrium'
    ];
    molecularView = `More ${productFormula} molecules → Reverse reaction favored → Reactant concentration increases`;
  }

  else if (type === 'remove-reactant') {
    direction = 'left';
    const reactantFormula = target || '';
    explanation = `Removing ${reactantFormula} (a reactant) decreases reactant concentration. The system shifts LEFT to produce more ${reactantFormula} from products.`;
    explanationIs = `Að fjarlægja ${reactantFormula} (hvarfefni) minnkar styrk hvarfefna. Kerfið hliðrast TIL VINSTRI til að framleiða meira af ${reactantFormula}.`;
    reasoning = [
      'Le Chatelier\'s Principle: System shifts to relieve stress',
      `Stress: Decreased [${reactantFormula}]`,
      'System response: Shift LEFT (←) toward reactants',
      'This replaces the removed reactant'
    ];
    molecularView = `Fewer ${reactantFormula} molecules → Reverse reaction favored → System tries to restore ${reactantFormula}`;
  }

  else if (type === 'remove-product') {
    direction = 'right';
    const productFormula = target || '';
    explanation = `Removing ${productFormula} (a product) decreases product concentration. The system shifts RIGHT to produce more ${productFormula} from reactants.`;
    explanationIs = `Að fjarlægja ${productFormula} (afurð) minnkar styrk afurða. Kerfið hliðrast TIL HÆGRI til að framleiða meira af ${productFormula}.`;
    reasoning = [
      'Le Chatelier\'s Principle: System shifts to relieve stress',
      `Stress: Decreased [${productFormula}]`,
      'System response: Shift RIGHT (→) toward products',
      'This replaces the removed product'
    ];
    molecularView = `Fewer ${productFormula} molecules → Forward reaction favored → System produces more ${productFormula}`;
  }

  // ==================== TEMPERATURE CHANGES ====================
  else if (type === 'increase-temp') {
    if (thermodynamics.type === 'endothermic') {
      // Endothermic (ΔH > 0): Heat is a REACTANT
      direction = 'right';
      explanation = `This reaction is ENDOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol > 0), so heat is a reactant. Increasing temperature is like adding a reactant. The system shifts RIGHT to consume the added heat.`;
      explanationIs = `Þetta hvarf er VARMABINDANDI (ΔH = ${thermodynamics.deltaH} kJ/mol > 0), svo hiti er hvarfefni. Að auka hitastig er eins og að bæta við hvarfefni. Kerfið hliðrast TIL HÆGRI til að neyta hitans.`;
      reasoning = [
        'Endothermic reaction: Heat is absorbed (heat is a reactant)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol > 0`,
        'Increasing T is like adding a reactant',
        'System shifts RIGHT (→) to consume heat energy'
      ];
      molecularView = 'Higher temperature → More kinetic energy → Endothermic (forward) reaction favored → Products increase';
    } else {
      // Exothermic (ΔH < 0): Heat is a PRODUCT
      direction = 'left';
      explanation = `This reaction is EXOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol < 0), so heat is a product. Increasing temperature is like adding a product. The system shifts LEFT to consume the added heat.`;
      explanationIs = `Þetta hvarf er VARMALOSANDI (ΔH = ${thermodynamics.deltaH} kJ/mol < 0), svo hiti er afurð. Að auka hitastig er eins og að bæta við afurð. Kerfið hliðrast TIL VINSTRI til að neyta hitans.`;
      reasoning = [
        'Exothermic reaction: Heat is released (heat is a product)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol < 0`,
        'Increasing T is like adding a product',
        'System shifts LEFT (←) to consume heat energy'
      ];
      molecularView = 'Higher temperature → Excess heat energy → Reverse (endothermic) direction favored → Reactants increase';
    }
  }

  else if (type === 'decrease-temp') {
    if (thermodynamics.type === 'endothermic') {
      // Endothermic (ΔH > 0): Heat is a REACTANT
      direction = 'left';
      explanation = `This reaction is ENDOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol > 0), so heat is a reactant. Decreasing temperature is like removing a reactant. The system shifts LEFT to produce more heat (and reactants).`;
      explanationIs = `Þetta hvarf er VARMABINDANDI (ΔH = ${thermodynamics.deltaH} kJ/mol > 0), svo hiti er hvarfefni. Að minnka hitastig er eins og að fjarlægja hvarfefni. Kerfið hliðrast TIL VINSTRI.`;
      reasoning = [
        'Endothermic reaction: Heat is absorbed (heat is a reactant)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol > 0`,
        'Decreasing T is like removing a reactant',
        'System shifts LEFT (←) toward reverse (exothermic) direction'
      ];
      molecularView = 'Lower temperature → Less energy available → Reverse reaction favored → Heat is released';
    } else {
      // Exothermic (ΔH < 0): Heat is a PRODUCT
      direction = 'right';
      explanation = `This reaction is EXOTHERMIC (ΔH = ${thermodynamics.deltaH} kJ/mol < 0), so heat is a product. Decreasing temperature is like removing a product. The system shifts RIGHT to produce more heat (and products).`;
      explanationIs = `Þetta hvarf er VARMALOSANDI (ΔH = ${thermodynamics.deltaH} kJ/mol < 0), svo hiti er afurð. Að minnka hitastig er eins og að fjarlægja afurð. Kerfið hliðrast TIL HÆGRI.`;
      reasoning = [
        'Exothermic reaction: Heat is released (heat is a product)',
        `ΔH = ${thermodynamics.deltaH} kJ/mol < 0`,
        'Decreasing T is like removing a product',
        'System shifts RIGHT (→) to release heat energy'
      ];
      molecularView = 'Lower temperature → System produces heat → Forward (exothermic) reaction favored → Products increase';
    }
  }

  // ==================== PRESSURE CHANGES (GAS ONLY) ====================
  else if (type === 'increase-pressure') {
    if (gasMoles.reactants === 0 && gasMoles.products === 0) {
      // No gas molecules - pressure has no effect
      direction = 'none';
      explanation = 'This equilibrium involves only aqueous or solid phases. Pressure changes do NOT affect equilibria without gas molecules. No shift occurs.';
      explanationIs = 'Þetta jafnvægi inniheldur aðeins vatnslausnir eða föst efni. Þrýstingsbreytingar hafa EKKI áhrif á jafnvægi án gasmólekúla. Engin hliðrun á sér stað.';
      reasoning = [
        'Pressure affects ONLY gas equilibria',
        'This system has no gas molecules',
        'No shift occurs (Q and K unchanged)'
      ];
      molecularView = 'Aqueous/solid species - volumes essentially incompressible - no shift';
    }
    else if (gasMoles.reactants === gasMoles.products) {
      // Equal moles - no shift
      direction = 'none';
      explanation = `Equal moles of gas: ${gasMoles.reactants} moles reactants ⇌ ${gasMoles.products} moles products. Increasing pressure affects both sides equally. No shift occurs.`;
      explanationIs = `Jafn fjöldi mólefna af gasi: ${gasMoles.reactants} mól hvarfefni ⇌ ${gasMoles.products} mól afurða. Að auka þrýsting hefur jöfn áhrif á báðar hliðar. Engin hliðrun.`;
      reasoning = [
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'Equal moles → pressure affects both sides equally',
        'No shift occurs'
      ];
      molecularView = 'Same number of gas molecules on each side → pressure increase has no net effect';
    }
    else if (gasMoles.reactants > gasMoles.products) {
      // Shift toward fewer moles (products)
      direction = 'right';
      explanation = `Increasing pressure favors the side with FEWER gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts RIGHT toward fewer moles.`;
      explanationIs = `Að auka þrýsting stuðlar að hliðinni með FÆRRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Afurðir: ${gasMoles.products} mól. Kerfið hliðrast TIL HÆGRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts RIGHT (→) toward fewer moles'
      ];
      molecularView = 'Increased pressure → Molecules compressed → System favors side with fewer gas molecules → Products';
    }
    else {
      // Shift toward fewer moles (reactants)
      direction = 'left';
      explanation = `Increasing pressure favors the side with FEWER gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts LEFT toward fewer moles.`;
      explanationIs = `Að auka þrýsting stuðlar að hliðinni með FÆRRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Afurðir: ${gasMoles.products} mól. Kerfið hliðrast TIL VINSTRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts LEFT (←) toward fewer moles'
      ];
      molecularView = 'Increased pressure → Molecules compressed → System favors side with fewer gas molecules → Reactants';
    }
  }

  else if (type === 'decrease-pressure') {
    if (gasMoles.reactants === 0 && gasMoles.products === 0) {
      // No gas molecules - pressure has no effect
      direction = 'none';
      explanation = 'This equilibrium involves only aqueous or solid phases. Pressure changes do NOT affect equilibria without gas molecules. No shift occurs.';
      explanationIs = 'Þetta jafnvægi inniheldur aðeins vatnslausnir eða föst efni. Þrýstingsbreytingar hafa EKKI áhrif á jafnvægi án gasmólekúla. Engin hliðrun.';
      reasoning = [
        'Pressure affects ONLY gas equilibria',
        'This system has no gas molecules',
        'No shift occurs'
      ];
      molecularView = 'Aqueous/solid species - volumes essentially incompressible - no shift';
    }
    else if (gasMoles.reactants === gasMoles.products) {
      // Equal moles - no shift
      direction = 'none';
      explanation = `Equal moles of gas: ${gasMoles.reactants} moles reactants ⇌ ${gasMoles.products} moles products. Decreasing pressure affects both sides equally. No shift occurs.`;
      explanationIs = `Jafn fjöldi mólefna af gasi: ${gasMoles.reactants} mól hvarfefni ⇌ ${gasMoles.products} mól afurða. Að minnka þrýsting hefur jöfn áhrif á báðar hliðar. Engin hliðrun.`;
      reasoning = [
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'Equal moles → pressure affects both sides equally',
        'No shift occurs'
      ];
      molecularView = 'Same number of gas molecules on each side → pressure decrease has no net effect';
    }
    else if (gasMoles.reactants > gasMoles.products) {
      // Shift toward more moles (reactants)
      direction = 'left';
      explanation = `Decreasing pressure favors the side with MORE gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts LEFT toward more moles.`;
      explanationIs = `Að minnka þrýsting stuðlar að hliðinni með FLEIRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Afurðir: ${gasMoles.products} mól. Kerfið hliðrast TIL VINSTRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts LEFT (←) toward more moles'
      ];
      molecularView = 'Decreased pressure → Volume increases → System favors side with more gas molecules → Reactants';
    }
    else {
      // Shift toward more moles (products)
      direction = 'right';
      explanation = `Decreasing pressure favors the side with MORE gas moles. Reactants: ${gasMoles.reactants} moles, Products: ${gasMoles.products} moles. System shifts RIGHT toward more moles.`;
      explanationIs = `Að minnka þrýsting stuðlar að hliðinni með FLEIRI gasmólum. Hvarfefni: ${gasMoles.reactants} mól, Afurðir: ${gasMoles.products} mól. Kerfið hliðrast TIL HÆGRI.`;
      reasoning = [
        'Le Chatelier: System shifts to relieve pressure stress',
        `Reactant gas moles: ${gasMoles.reactants}`,
        `Product gas moles: ${gasMoles.products}`,
        'System shifts RIGHT (→) toward more moles'
      ];
      molecularView = 'Decreased pressure → Volume increases → System favors side with more gas molecules → Products';
    }
  }

  // ==================== CATALYST ====================
  else if (type === 'add-catalyst') {
    direction = 'none';
    explanation = 'A CATALYST lowers the activation energy for BOTH forward and reverse reactions EQUALLY. The equilibrium constant K is UNCHANGED. The system reaches equilibrium faster, but the final position is the same. NO SHIFT occurs.';
    explanationIs = 'HVATI lækkar virkniorku fyrir BÆÐI fram og aftur hvarf JAFNT. Jafnvægisfastinn K er ÓBREYTTUR. Kerfið nær jafnvægi hraðar, en lokastaðan er sú sama. ENGIN HLIÐRUN á sér stað.';
    reasoning = [
      'Catalyst lowers activation energy (Ea) for both directions',
      'Forward rate increases by same factor as reverse rate',
      'K = kforward / kreverse remains unchanged',
      'Equilibrium reached faster, but same final position',
      'NO SHIFT - this is critical to understand!'
    ];
    molecularView = 'Catalyst provides alternate pathway → Both reactions speed up equally → Same equilibrium position reached faster';
  }

  return {
    direction,
    explanation,
    explanationIs,
    reasoning,
    molecularView
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
      return `Bæta við ${target} (afurð)`;
    case 'remove-reactant':
      return `Fjarlægja ${target} (hvarfefni)`;
    case 'remove-product':
      return `Fjarlægja ${target} (afurð)`;
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
  return equilibrium.reactants.some(r => r.formula === formula);
};

export const isProduct = (formula: string, equilibrium: Equilibrium): boolean => {
  return equilibrium.products.some(p => p.formula === formula);
};
