import { ChemiGuardEngine } from './chemiguard';
import type { WasteItem } from '../../types';

// Mock items for validation
const nitricAcid: WasteItem = {
  id: 'test-1',
  labId: 'lab-1',
  name: 'Nitric Acid 68%',
  epaGroup: 'GROUP_3A_OXIDIZERS',
  dotClass: 'Class 8',
  unCode: 'UN2031',
  volumeLiters: 12,
  containerType: '5L Carboy',
  condition: 'GOOD',
  urgency: 'URGENT',
  expirationDate: '2026-09-10',
  daysUntilExpiring: 6,
  status: 'AVAILABLE',
};

const acetone: WasteItem = {
  id: 'test-2',
  labId: 'lab-7',
  name: 'Acetone Solvents',
  epaGroup: 'GROUP_3B_FLAMMABLES_ORGANIC',
  dotClass: 'Class 3',
  unCode: 'UN1090',
  volumeLiters: 20,
  containerType: '20L Drum',
  condition: 'GOOD',
  urgency: 'HIGH',
  expirationDate: '2026-09-15',
  daysUntilExpiring: 11,
  status: 'AVAILABLE',
};

const bleach: WasteItem = {
  id: 'test-3',
  labId: 'lab-2',
  name: 'Concentrated Bleach (Sodium Hypochlorite)',
  epaGroup: 'GROUP_5_BLEACH',
  dotClass: 'Class 8',
  unCode: 'UN1791',
  volumeLiters: 15,
  containerType: '10L Carboy',
  condition: 'GOOD',
  urgency: 'MEDIUM',
  expirationDate: '2026-10-01',
  daysUntilExpiring: 27,
  status: 'AVAILABLE',
};

const ammonia: WasteItem = {
  id: 'test-4',
  labId: 'lab-5',
  name: 'Aqueous Ammonia 28%',
  epaGroup: 'GROUP_5_AMMONIA',
  dotClass: 'Class 8',
  unCode: 'UN2672',
  volumeLiters: 10,
  containerType: '5L Carboy',
  condition: 'GOOD',
  urgency: 'HIGH',
  expirationDate: '2026-09-25',
  daysUntilExpiring: 21,
  status: 'AVAILABLE',
};

const hydrochloricAcid: WasteItem = {
  id: 'test-5',
  labId: 'lab-4',
  name: 'Hydrochloric Acid 37%',
  epaGroup: 'GROUP_1A_ACIDS',
  dotClass: 'Class 8',
  unCode: 'UN1789',
  volumeLiters: 15,
  containerType: '10L Carboy',
  condition: 'GOOD',
  urgency: 'MEDIUM',
  expirationDate: '2026-10-10',
  daysUntilExpiring: 36,
  status: 'AVAILABLE',
};

const sodiumCyanide: WasteItem = {
  id: 'test-6',
  labId: 'lab-4',
  name: 'Sodium Cyanide 5%',
  epaGroup: 'GROUP_2B_CYANIDES_SULFIDES',
  dotClass: 'Class 6.1',
  unCode: 'UN3414',
  volumeLiters: 5,
  containerType: '5L Carboy',
  condition: 'GOOD',
  urgency: 'URGENT',
  expirationDate: '2026-09-08',
  daysUntilExpiring: 4,
  status: 'AVAILABLE',
};

const ethanol: WasteItem = {
  id: 'test-7',
  labId: 'lab-3',
  name: 'Denatured Ethanol 95%',
  epaGroup: 'GROUP_3B_FLAMMABLES_ORGANIC',
  dotClass: 'Class 3',
  unCode: 'UN1170',
  volumeLiters: 25,
  containerType: '20L Drum',
  condition: 'GOOD',
  urgency: 'LOW',
  expirationDate: '2026-11-01',
  daysUntilExpiring: 58,
  status: 'AVAILABLE',
};

export function runChemiGuardVerification(): boolean {
  console.log('--- STARTING CHEMIGUARD VERIFICATION SUITE ---');

  // Test 1: Nitric Acid + Acetone (Should be BLOCKED with EXPLOSION)
  const test1 = ChemiGuardEngine.checkPair(nitricAcid, acetone);
  if (!test1 || test1.consequence !== 'EXPLOSION') {
    console.error('FAILED: Nitric Acid + Acetone was not blocked with EXPLOSION!');
    return false;
  }
  console.log('✓ PASS: Nitric Acid + Acetone -> Blocked (EXPLOSION)');

  // Test 2: Bleach + Ammonia (Should be BLOCKED with TOXIC_GAS)
  const test2 = ChemiGuardEngine.checkPair(bleach, ammonia);
  if (!test2 || test2.consequence !== 'TOXIC_GAS') {
    console.error('FAILED: Bleach + Ammonia was not blocked with TOXIC_GAS!');
    return false;
  }
  console.log('✓ PASS: Bleach + Ammonia -> Blocked (TOXIC_GAS chloramine)');

  // Test 3: Acid + Cyanide (Should be BLOCKED with TOXIC_GAS)
  const test3 = ChemiGuardEngine.checkPair(hydrochloricAcid, sodiumCyanide);
  if (!test3 || test3.consequence !== 'TOXIC_GAS') {
    console.error('FAILED: Acid + Cyanide was not blocked with TOXIC_GAS!');
    return false;
  }
  console.log('✓ PASS: Acid + Cyanide -> Blocked (TOXIC_GAS HCN)');

  // Test 4: Acetone + Ethanol (Compatible flammables, should be SAFE)
  const test4 = ChemiGuardEngine.checkPair(acetone, ethanol);
  if (test4 !== null) {
    console.error('FAILED: Acetone + Ethanol was incorrectly flagged as incompatible!');
    return false;
  }
  console.log('✓ PASS: Acetone + Ethanol -> SAFE (100% Compatible)');

  // Test 5: Whole lot evaluation
  const lotEvaluation = ChemiGuardEngine.evaluateLot([nitricAcid, acetone, bleach, ammonia]);
  if (lotEvaluation.isSafe || lotEvaluation.issues.length < 2) {
    console.error('FAILED: Lot evaluation did not catch multiple issues!');
    return false;
  }
  console.log(`✓ PASS: Mixed Lot evaluated ${lotEvaluation.checkedCount} pairs, flagged ${lotEvaluation.issues.length} violations.`);

  console.log('--- CHEMIGUARD VERIFICATION SUITE PASSED ALL CHECKS ---');
  return true;
}

runChemiGuardVerification();

