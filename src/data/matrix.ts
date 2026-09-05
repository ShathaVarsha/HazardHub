import type { EPAGroup } from '../types';

export interface EPARuleDefinition {
  id: string;
  groupA: EPAGroup;
  groupB: EPAGroup;
  hazardTitle: string;
  consequence: 'EXPLOSION' | 'TOXIC_GAS' | 'CORROSIVE_SPATTER' | 'FIRE';
  epaCitation: string; // e.g., '40 CFR Part 264 Appendix V (Group 1-A vs 1-B)'
  scientificExplanation: string;
  remedy: string;
}

export const EPA_INCOMPATIBILITY_RULES: EPARuleDefinition[] = [
  // 1. Group 1-A (Acids) vs Group 1-B (Caustics/Bases)
  {
    id: 'RULE_ACID_BASE',
    groupA: 'GROUP_1A_ACIDS',
    groupB: 'GROUP_1B_BASES',
    hazardTitle: 'Violent Neutralization & Corrosive Thermal Spatter',
    consequence: 'CORROSIVE_SPATTER',
    epaCitation: 'EPA 40 CFR 264 App. V Group 1-A vs 1-B',
    scientificExplanation:
      'Mixing mineral acids (e.g., HCl, H2SO4) with concentrated alkaline hydroxides (NaOH, KOH) triggers an intense exothermic acid-base neutralization. Heat generation can boil the mixture instantly, projecting corrosive liquids and overpressurizing closed drums.',
    remedy: 'Segregate acids and bases into physically isolated transport compartments or assign to separate pickup lots.',
  },

  // 2. Group 1-A (Acids) vs Group 2-B (Cyanides & Sulfides)
  {
    id: 'RULE_ACID_CYANIDE',
    groupA: 'GROUP_1A_ACIDS',
    groupB: 'GROUP_2B_CYANIDES_SULFIDES',
    hazardTitle: 'Deadly Hydrogen Cyanide (HCN) / Hydrogen Sulfide (H2S) Gas Generation',
    consequence: 'TOXIC_GAS',
    epaCitation: 'EPA 40 CFR 264 App. V Group 2-A/1-A vs 2-B',
    scientificExplanation:
      'Acidification of inorganic cyanides or sulfides immediately generates lethal, rapidly fatal toxic gases (Hydrogen Cyanide HCN or Hydrogen Sulfide H2S) that breach canister gaskets and overwhelm vehicle cabs.',
    remedy: 'CRITICAL SAFETY BLOCK: Cyanide/sulfide containers must NEVER share transport lots with acidic compounds. Strict separate manifest required.',
  },

  // 3. Group 3-A (Strong Oxidizers) vs Group 3-B (Flammable Organics)
  {
    id: 'RULE_OXIDIZER_ORGANIC',
    groupA: 'GROUP_3A_OXIDIZERS',
    groupB: 'GROUP_3B_FLAMMABLES_ORGANIC',
    hazardTitle: 'Violent Fire, Rapid Deflagration & Explosive Oxidation',
    consequence: 'EXPLOSION',
    epaCitation: 'EPA 40 CFR 264 App. V Group 3-A vs 3-B',
    scientificExplanation:
      'Strong oxidizers (such as concentrated Nitric Acid 68%, Potassium Permanganate, Peroxides) supply hyper-reactive oxygen to combustible organic solvents (Acetone, Xylene, Alcohols, Toluene). Reaction is intensely exothermic and prone to spontaneous detonation or fire upon minor container leakage.',
    remedy: 'Immediately segregate oxidizers from flammable solvents. Co-loading on standard collection trucks is strictly prohibited by DOT 49 CFR 177.848.',
  },

  // 4. Group 4-A (Halogenated Solvents) vs Group 4-B (Reactive Metals)
  {
    id: 'RULE_HALOGEN_METAL',
    groupA: 'GROUP_4A_HALOGENATED',
    groupB: 'GROUP_4B_REACTIVE_METALS',
    hazardTitle: 'Exothermic Dehalogenation & Toxic Phosgene Formation',
    consequence: 'TOXIC_GAS',
    epaCitation: 'EPA 40 CFR 264 App. V Group 4-A vs 4-B',
    scientificExplanation:
      'Halogenated solvents (Dichloromethane, Chloroform) react aggressively with reactive metal powders (Zinc, Aluminum, Magnesium, or Mercury amalgam) generating toxic gas, organic halides, and potential autocatalytic pressure spikes in enclosed drums.',
    remedy: 'Package amalgam/reactive metal solids in certified UN-rated separate overpacks; do not bundle with bulk halogenated liquid drums.',
  },

  // 5. Group 5 (Bleach / Hypochlorite) vs Group 5 (Concentrated Ammonia)
  {
    id: 'RULE_BLEACH_AMMONIA',
    groupA: 'GROUP_5_BLEACH',
    groupB: 'GROUP_5_AMMONIA',
    hazardTitle: 'Lethal Chloramine Vapor ($NH_2Cl$) & Nitrogen Trichloride Explosion Hazard',
    consequence: 'TOXIC_GAS',
    epaCitation: 'EPA Hazardous Waste Management Guidelines - Incompatible Reagents',
    scientificExplanation:
      'Sodium hypochlorite reacts with aqueous ammonia to produce monochloramine and dichloramine toxic vapors, causing severe pulmonary edema. In concentrated forms, shock-sensitive nitrogen trichloride can form.',
    remedy: 'Isolate bleach sanitizers and ammonia reagents. Transport on separate pallets.',
  },

  // 6. Group 1-A (Acids) vs Group 5 (Bleach / Hypochlorite)
  {
    id: 'RULE_ACID_BLEACH',
    groupA: 'GROUP_1A_ACIDS',
    groupB: 'GROUP_5_BLEACH',
    hazardTitle: 'Toxic Chlorine Gas ($Cl_2$) Evolution',
    consequence: 'TOXIC_GAS',
    epaCitation: 'EPA 40 CFR 264 App. V Toxic Gas Release Guidelines',
    scientificExplanation:
      'Adding acid to hypochlorite bleach shifts equilibrium to release choking, greenish-yellow Chlorine gas ($Cl_2$), an acute respiratory poison.',
    remedy: 'Do not combine bleach containers with acid waste lots under any circumstance.',
  },
];
