import { WasteItem, CompatibilityViolation, CompatibilityWarning, BatchCompatibilityReport } from '../types';

/**
 * CHEMICGUARD DETERMINISTIC SAFETY ENGINE
 * EPA 40 CFR § 264.177 & DOT 49 CFR § 177.848 Segregation Matrix
 * 
 * Safety Critical: This engine executes mathematical and rule-based deterministic checks.
 * Decisions made here CANNOT be bypassed by AI reasoning.
 */

interface MatrixRule {
  id: string;
  match: (a: WasteItem, b: WasteItem) => boolean;
  severity: 'CRITICAL_BLOCK' | 'WARNING';
  reason: string;
  reactionConsequence: string;
  epaCitation: string;
  dotCitation: string;
}

const DETERMINISTIC_RULES: MatrixRule[] = [
  // 1. Lethal Cyanide Gas Hazard (Acid + Cyanide)
  {
    id: 'ACID_CYANIDE_DEADLY_GAS',
    match: (a, b) => {
      const isCyanide = (item: WasteItem) =>
        item.epaWasteCode === 'P106' ||
        item.chemicalName.toLowerCase().includes('cyanide') ||
        item.casNumber === '143-33-9';
      const isAcid = (item: WasteItem) =>
        item.hazardClass === 'Corrosive Acid' || (item.ph !== undefined && item.ph < 6.0);
      return (isCyanide(a) && isAcid(b)) || (isCyanide(b) && isAcid(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'EPA Group 1-A (Mineral Acids) + EPA Group 7-A (Cyanides/Sulfides) Catastrophic Mixing',
    reactionConsequence:
      'Immediate generation of lethal Hydrogen Cyanide (HCN) gas. Rapid fatal atmospheric toxicity and violent venting. Strictly prohibited under federal law.',
    epaCitation: 'EPA 40 CFR § 264.177 Appendix V Group 1-A / 7-A',
    dotCitation: 'DOT 49 CFR § 177.848(e) Table 1 - Segregation of Cyanides and Acids',
  },

  // 2. Toxic Chlorine Gas (Hypochlorite Bleach + Acid)
  {
    id: 'BLEACH_ACID_CHLORINE_GAS',
    match: (a, b) => {
      const isHypochlorite = (item: WasteItem) =>
        item.chemicalName.toLowerCase().includes('hypochlorite') ||
        item.casNumber.includes('7681-52-9');
      const isAcid = (item: WasteItem) =>
        item.hazardClass === 'Corrosive Acid' || (item.ph !== undefined && item.ph < 5.0);
      return (isHypochlorite(a) && isAcid(b)) || (isHypochlorite(b) && isAcid(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'Hypochlorite Solution Contact with Mineral or Organic Acid',
    reactionConsequence:
      'Rapid acidification liberates heavy toxic Chlorine (Cl2) gas. Causes chemical pulmonary edema, acute respiratory distress, and drum pressurization.',
    epaCitation: 'EPA 40 CFR § 264.177(c) - Incompatible Waste Decomposition',
    dotCitation: 'DOT 49 CFR § 173.21 - Prohibited Transport of Polymerizing/Gas-Evolving Mixtures',
  },

  // 3. Toxic Chloramine Vapors (Hypochlorite Bleach + Ammonia)
  {
    id: 'BLEACH_AMMONIA_CHLORAMINE',
    match: (a, b) => {
      const isBleach = (item: WasteItem) => item.chemicalName.toLowerCase().includes('hypochlorite');
      const isAmmonia = (item: WasteItem) =>
        item.chemicalName.toLowerCase().includes('ammonium') ||
        item.chemicalName.toLowerCase().includes('ammonia');
      return (isBleach(a) && isAmmonia(b)) || (isBleach(b) && isAmmonia(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'Hypochlorite Bleach Contact with Ammonia / Amine Compounds',
    reactionConsequence:
      'Spontaneous production of volatile toxic Chloramine and Dichloramine vapors with severe ocular and mucous membrane destruction.',
    epaCitation: 'EPA 40 CFR § 264.177 - Incompatible Waste Segregation',
    dotCitation: 'DOT 49 CFR § 177.848 - Incompatible Class 8 Corrosives',
  },

  // 4. Violent Exothermic Neutralization (Strong Acid + Strong Base)
  {
    id: 'STRONG_ACID_STRONG_BASE',
    match: (a, b) => {
      const isAcid = (item: WasteItem) =>
        item.hazardClass === 'Corrosive Acid' || (item.ph !== undefined && item.ph < 3.0);
      const isBase = (item: WasteItem) =>
        item.hazardClass === 'Corrosive Base' || (item.ph !== undefined && item.ph > 11.5);
      return (isAcid(a) && isBase(b)) || (isAcid(b) && isBase(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'Group 1-A (Strong Acids) + Group 1-B (Caustics/Alkaline Hydroxides)',
    reactionConsequence:
      'Extremely high exothermic neutralization enthalpy (ΔH ~ -57 kJ/mol). Flash boiling of solvent, aerosolization of corrosive liquids, and container overpressurization or catastrophic rupture.',
    epaCitation: 'EPA 40 CFR § 264.177 Appendix V Group 1-A & 1-B',
    dotCitation: 'DOT 49 CFR § 177.848(d) - Class 8 Acid/Base Physical Isolation',
  },

  // 5. Spontaneous Combustion & Fire (Strong Oxidizers + Flammable Liquids)
  {
    id: 'OXIDIZER_FLAMMABLE_COMBUSTION',
    match: (a, b) => {
      const isOxidizer = (item: WasteItem) =>
        item.hazardClass === 'Oxidizer' ||
        item.chemicalName.toLowerCase().includes('nitric acid') ||
        item.chemicalName.toLowerCase().includes('permanganate') ||
        item.chemicalName.toLowerCase().includes('peroxide') ||
        item.chemicalName.toLowerCase().includes('chromic');
      const isFlammable = (item: WasteItem) =>
        item.hazardClass === 'Flammable Liquid' ||
        (item.flashPointF !== undefined && item.flashPointF < 100);
      return (isOxidizer(a) && isFlammable(b)) || (isOxidizer(b) && isFlammable(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'EPA Group 2-A (Oxidizers) + EPA Group 2-B (Flammable Liquids & Volatiles)',
    reactionConsequence:
      'Hypergolic or self-accelerating oxidation leading to spontaneous ignition, fireball combustion, and explosive vapor expansion in sealed transport hold.',
    epaCitation: 'EPA 40 CFR § 264.177 Appendix V Group 2-A & 2-B',
    dotCitation: 'DOT 49 CFR § 177.848 Table "X" - Division 5.1 & Class 3 Strict Segregation',
  },

  // 6. Water Reactive & Explosive Hydrogen Gas Evolution
  {
    id: 'WATER_REACTIVE_EXPLOSIVE_H2',
    match: (a, b) => {
      const isWaterReactive = (item: WasteItem) =>
        item.hazardClass === 'Water Reactive' || item.epaWasteCode === 'D003';
      const isAqueousOrAcid = (item: WasteItem) =>
        item.hazardClass === 'Corrosive Acid' ||
        item.chemicalName.toLowerCase().includes('aqueous') ||
        item.chemicalName.toLowerCase().includes('water') ||
        item.chemicalName.toLowerCase().includes('digestate');
      return (isWaterReactive(a) && isAqueousOrAcid(b)) || (isWaterReactive(b) && isAqueousOrAcid(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'EPA Group 3-A (Water Reactives/Hydrides) + EPA Group 3-B (Aqueous Solutions/Acids)',
    reactionConsequence:
      'Vigorous hydrolysis generating flammable Hydrogen gas (H2) and high thermal output. Immediate deflagration upon contact with ambient static or spark.',
    epaCitation: 'EPA 40 CFR § 264.177 Appendix V Group 3-A & 3-B',
    dotCitation: 'DOT 49 CFR § 177.848 - Dangerous When Wet Segregation',
  },

  // 7. Organic Peroxide Shock/Thermal Sensitivity
  {
    id: 'ORGANIC_PEROXIDE_CONTAMINATION',
    match: (a, b) => {
      const isPeroxide = (item: WasteItem) => item.hazardClass === 'Organic Peroxide';
      const isReactiveNeighbor = (item: WasteItem) =>
        item.hazardClass === 'Corrosive Acid' ||
        item.hazardClass === 'Toxic Heavy Metal' ||
        item.hazardClass === 'Flammable Liquid';
      return (isPeroxide(a) && isReactiveNeighbor(b)) || (isPeroxide(b) && isReactiveNeighbor(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'Division 5.2 Organic Peroxide Physical Co-loading with Contaminants',
    reactionConsequence:
      'Heavy metal ions or acid catalyze rapid exothermal radical degradation, triggering self-accelerating decomposition temperature (SADT) and blast detonation.',
    epaCitation: 'EPA 40 CFR § 264.177(a) - Organic Peroxide Isolation',
    dotCitation: 'DOT 49 CFR § 177.848(f) - Division 5.2 Dedicated Bay Mandate',
  },

  // 8. Warning: Nitric Acid + Glacial Acetic Acid (Combustible Organic Acid)
  {
    id: 'NITRIC_ORGANIC_ACID_WARNING',
    match: (a, b) => {
      const isNitric = (item: WasteItem) => item.chemicalName.toLowerCase().includes('nitric');
      const isAcetic = (item: WasteItem) => item.chemicalName.toLowerCase().includes('acetic');
      return (isNitric(a) && isAcetic(b)) || (isNitric(b) && isAcetic(a));
    },
    severity: 'CRITICAL_BLOCK',
    reason: 'Strong Nitrating Inorganic Acid + Combustible Carboxylic Acid',
    reactionConsequence:
      'Oxidation of organic carbon skeleton releasing brown toxic Nitrogen Dioxide (NO2) fumes, substantial exothermic gas evolution, and potential ignition.',
    epaCitation: 'EPA 40 CFR § 264.177 - Organic Acid Incompatibility',
    dotCitation: 'DOT 49 CFR § 173.21 - Nitric Acid Transport Restrictions',
  },
];

export class ChemiGuardEngine {
  /**
   * Evaluates pairwise chemical safety between two specific waste items.
   */
  public validatePair(
    itemA: WasteItem,
    itemB: WasteItem
  ): {
    isCompatible: boolean;
    violation?: CompatibilityViolation;
    warning?: CompatibilityWarning;
  } {
    if (itemA.id === itemB.id) {
      return { isCompatible: true };
    }

    for (const rule of DETERMINISTIC_RULES) {
      if (rule.match(itemA, itemB)) {
        if (rule.severity === 'CRITICAL_BLOCK') {
          return {
            isCompatible: false,
            violation: {
              itemA,
              itemB,
              reason: rule.reason,
              reactionSeverity: 'CRITICAL_BLOCK',
              reactionConsequence: rule.reactionConsequence,
              epaCitation: rule.epaCitation,
              dotCitation: rule.dotCitation,
            },
          };
        } else {
          return {
            isCompatible: true,
            warning: {
              itemA,
              itemB,
              warningNote: rule.reactionConsequence,
              segregationGroup: rule.reason,
            },
          };
        }
      }
    }

    // Default safe pairwise compatibility
    return { isCompatible: true };
  }

  /**
   * Deterministically validates an entire batch of waste items (O(N^2) comprehensive pairwise check).
   */
  public validateBatch(items: WasteItem[]): BatchCompatibilityReport {
    const violations: CompatibilityViolation[] = [];
    const warnings: CompatibilityWarning[] = [];
    const seenPairs = new Set<string>();
    let totalPairsChecked = 0;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const itemA = items[i];
        const itemB = items[j];
        const pairKey = [itemA.id, itemB.id].sort().join('::');

        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);
        totalPairsChecked++;

        const result = this.validatePair(itemA, itemB);
        if (result.violation) {
          violations.push(result.violation);
        }
        if (result.warning) {
          warnings.push(result.warning);
        }
      }
    }

    // Build Segregation Group Index
    const segregationGroups: Record<string, string[]> = {};
    for (const item of items) {
      if (!segregationGroups[item.hazardClass]) {
        segregationGroups[item.hazardClass] = [];
      }
      segregationGroups[item.hazardClass].push(item.trackingId);
    }

    return {
      isSafe: violations.length === 0,
      violations,
      warnings,
      compatibleCount: items.length - violations.length,
      totalPairsChecked,
      segregationGroups,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Checks if an individual candidate item can be safely added to an existing batch.
   */
  public canAddItemToBatch(
    batch: WasteItem[],
    candidate: WasteItem
  ): { isSafe: boolean; violation?: CompatibilityViolation } {
    for (const item of batch) {
      const result = this.validatePair(item, candidate);
      if (result.violation) {
        return { isSafe: false, violation: result.violation };
      }
    }
    return { isSafe: true };
  }
}

export const chemiGuard = new ChemiGuardEngine();
