"""
EPA Incompatibility Matrix Data
Pure Python equivalent to src/data/matrix.ts
EPA 40 CFR Part 264 Appendix V Incompatible Waste Combination Rules
"""

from dataclasses import dataclass
from typing import List
from models import EPAGroup, Consequence


@dataclass
class EPARuleDefinition:
    id: str
    group_a: EPAGroup
    group_b: EPAGroup
    hazard_title: str
    consequence: Consequence
    epa_citation: str          # e.g. '40 CFR Part 264 Appendix V (Group 1-A vs 1-B)'
    scientific_explanation: str
    remedy: str


EPA_INCOMPATIBILITY_RULES: List[EPARuleDefinition] = [
    # 1. Group 1-A (Acids) vs Group 1-B (Caustics/Bases)
    EPARuleDefinition(
        id='RULE_ACID_BASE',
        group_a='GROUP_1A_ACIDS',
        group_b='GROUP_1B_BASES',
        hazard_title='Violent Neutralization & Corrosive Thermal Spatter',
        consequence='CORROSIVE_SPATTER',
        epa_citation='EPA 40 CFR 264 App. V Group 1-A vs 1-B',
        scientific_explanation=(
            'Mixing mineral acids (e.g., HCl, H2SO4) with concentrated alkaline hydroxides '
            '(NaOH, KOH) triggers an intense exothermic acid-base neutralization. Heat generation '
            'can boil the mixture instantly, projecting corrosive liquids and overpressurizing closed drums.'
        ),
        remedy='Segregate acids and bases into physically isolated transport compartments or assign to separate pickup lots.',
    ),

    # 2. Group 1-A (Acids) vs Group 2-B (Cyanides & Sulfides)
    EPARuleDefinition(
        id='RULE_ACID_CYANIDE',
        group_a='GROUP_1A_ACIDS',
        group_b='GROUP_2B_CYANIDES_SULFIDES',
        hazard_title='Deadly Hydrogen Cyanide (HCN) / Hydrogen Sulfide (H2S) Gas Generation',
        consequence='TOXIC_GAS',
        epa_citation='EPA 40 CFR 264 App. V Group 2-A/1-A vs 2-B',
        scientific_explanation=(
            'Acidification of inorganic cyanides or sulfides immediately generates lethal, '
            'rapidly fatal toxic gases (Hydrogen Cyanide HCN or Hydrogen Sulfide H2S) that '
            'breach canister gaskets and overwhelm vehicle cabs.'
        ),
        remedy='CRITICAL SAFETY BLOCK: Cyanide/sulfide containers must NEVER share transport lots with acidic compounds. Strict separate manifest required.',
    ),

    # 3. Group 3-A (Strong Oxidizers) vs Group 3-B (Flammable Organics)
    EPARuleDefinition(
        id='RULE_OXIDIZER_ORGANIC',
        group_a='GROUP_3A_OXIDIZERS',
        group_b='GROUP_3B_FLAMMABLES_ORGANIC',
        hazard_title='Violent Fire, Rapid Deflagration & Explosive Oxidation',
        consequence='EXPLOSION',
        epa_citation='EPA 40 CFR 264 App. V Group 3-A vs 3-B',
        scientific_explanation=(
            'Strong oxidizers (such as concentrated Nitric Acid 68%, Potassium Permanganate, '
            'Peroxides) supply hyper-reactive oxygen to combustible organic solvents (Acetone, '
            'Xylene, Alcohols, Toluene). Reaction is intensely exothermic and prone to spontaneous '
            'detonation or fire upon minor container leakage.'
        ),
        remedy='Immediately segregate oxidizers from flammable solvents. Co-loading on standard collection trucks is strictly prohibited by DOT 49 CFR 177.848.',
    ),

    # 4. Group 4-A (Halogenated Solvents) vs Group 4-B (Reactive Metals)
    EPARuleDefinition(
        id='RULE_HALOGEN_METAL',
        group_a='GROUP_4A_HALOGENATED',
        group_b='GROUP_4B_REACTIVE_METALS',
        hazard_title='Exothermic Dehalogenation & Toxic Phosgene Formation',
        consequence='TOXIC_GAS',
        epa_citation='EPA 40 CFR 264 App. V Group 4-A vs 4-B',
        scientific_explanation=(
            'Halogenated solvents (Dichloromethane, Chloroform) react aggressively with reactive '
            'metal powders (Zinc, Aluminum, Magnesium, or Mercury amalgam) generating toxic gas, '
            'organic halides, and potential autocatalytic pressure spikes in enclosed drums.'
        ),
        remedy='Package amalgam/reactive metal solids in certified UN-rated separate overpacks; do not bundle with bulk halogenated liquid drums.',
    ),

    # 5. Group 5 (Bleach / Hypochlorite) vs Group 5 (Concentrated Ammonia)
    EPARuleDefinition(
        id='RULE_BLEACH_AMMONIA',
        group_a='GROUP_5_BLEACH',
        group_b='GROUP_5_AMMONIA',
        hazard_title='Lethal Chloramine Vapor (NH2Cl) & Nitrogen Trichloride Explosion Hazard',
        consequence='TOXIC_GAS',
        epa_citation='EPA Hazardous Waste Management Guidelines - Incompatible Reagents',
        scientific_explanation=(
            'Sodium hypochlorite reacts with aqueous ammonia to produce monochloramine and '
            'dichloramine toxic vapors, causing severe pulmonary edema. In concentrated forms, '
            'shock-sensitive nitrogen trichloride can form.'
        ),
        remedy='Isolate bleach sanitizers and ammonia reagents. Transport on separate pallets.',
    ),

    # 6. Group 1-A (Acids) vs Group 5 (Bleach / Hypochlorite)
    EPARuleDefinition(
        id='RULE_ACID_BLEACH',
        group_a='GROUP_1A_ACIDS',
        group_b='GROUP_5_BLEACH',
        hazard_title='Toxic Chlorine Gas (Cl2) Evolution',
        consequence='TOXIC_GAS',
        epa_citation='EPA 40 CFR 264 App. V Toxic Gas Release Guidelines',
        scientific_explanation=(
            'Adding acid to hypochlorite bleach shifts equilibrium to release choking, '
            'greenish-yellow Chlorine gas (Cl2), an acute respiratory poison.'
        ),
        remedy='Do not combine bleach containers with acid waste lots under any circumstance.',
    ),
]
