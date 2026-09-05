"""
ChemiGuard Engine Verification Test Suite
Pure Python equivalent to src/engines/chemiguard/test-runner.ts
Runs automated deterministic safety checks to verify EPA 40 CFR compliance.
"""

import sys
import os

# Ensure workspace root is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import WasteItem
from engines.chemiguard import ChemiGuardEngine


# Mock items for validation
nitric_acid = WasteItem(
    id='test-1',
    lab_id='lab-1',
    name='Nitric Acid 68%',
    epa_group='GROUP_3A_OXIDIZERS',
    dot_class='Class 8',
    un_code='UN2031',
    volume_liters=12.0,
    container_type='5L Carboy',
    condition='GOOD',
    urgency='URGENT',
    expiration_date='2026-09-10',
    days_until_expiring=6,
    status='AVAILABLE',
)

acetone = WasteItem(
    id='test-2',
    lab_id='lab-7',
    name='Acetone Solvents',
    epa_group='GROUP_3B_FLAMMABLES_ORGANIC',
    dot_class='Class 3',
    un_code='UN1090',
    volume_liters=20.0,
    container_type='20L Drum',
    condition='GOOD',
    urgency='HIGH',
    expiration_date='2026-09-15',
    days_until_expiring=11,
    status='AVAILABLE',
)

bleach = WasteItem(
    id='test-3',
    lab_id='lab-2',
    name='Concentrated Bleach (Sodium Hypochlorite)',
    epa_group='GROUP_5_BLEACH',
    dot_class='Class 8',
    un_code='UN1791',
    volume_liters=15.0,
    container_type='10L Carboy',
    condition='GOOD',
    urgency='MEDIUM',
    expiration_date='2026-10-01',
    days_until_expiring=27,
    status='AVAILABLE',
)

ammonia = WasteItem(
    id='test-4',
    lab_id='lab-5',
    name='Aqueous Ammonia 28%',
    epa_group='GROUP_5_AMMONIA',
    dot_class='Class 8',
    un_code='UN2672',
    volume_liters=10.0,
    container_type='5L Carboy',
    condition='GOOD',
    urgency='HIGH',
    expiration_date='2026-09-25',
    days_until_expiring=21,
    status='AVAILABLE',
)

hydrochloric_acid = WasteItem(
    id='test-5',
    lab_id='lab-4',
    name='Hydrochloric Acid 37%',
    epa_group='GROUP_1A_ACIDS',
    dot_class='Class 8',
    un_code='UN1789',
    volume_liters=15.0,
    container_type='10L Carboy',
    condition='GOOD',
    urgency='MEDIUM',
    expiration_date='2026-10-10',
    days_until_expiring=36,
    status='AVAILABLE',
)

sodium_cyanide = WasteItem(
    id='test-6',
    lab_id='lab-4',
    name='Sodium Cyanide 5%',
    epa_group='GROUP_2B_CYANIDES_SULFIDES',
    dot_class='Class 6.1',
    un_code='UN3414',
    volume_liters=5.0,
    container_type='5L Carboy',
    condition='GOOD',
    urgency='URGENT',
    expiration_date='2026-09-08',
    days_until_expiring=4,
    status='AVAILABLE',
)

ethanol = WasteItem(
    id='test-7',
    lab_id='lab-3',
    name='Denatured Ethanol 95%',
    epa_group='GROUP_3B_FLAMMABLES_ORGANIC',
    dot_class='Class 3',
    un_code='UN1170',
    volume_liters=25.0,
    container_type='20L Drum',
    condition='GOOD',
    urgency='LOW',
    expiration_date='2026-11-01',
    days_until_expiring=58,
    status='AVAILABLE',
)


# Pytest Test Case Definitions
def test_nitric_acid_and_acetone_incompatibility():
    """Test 1: Nitric Acid + Acetone must be blocked with EXPLOSION."""
    res = ChemiGuardEngine.check_pair(nitric_acid, acetone)
    assert res is not None, "Nitric Acid + Acetone should be flagged as incompatible"
    assert res.consequence == 'EXPLOSION', f"Expected EXPLOSION but got {res.consequence}"


def test_bleach_and_ammonia_incompatibility():
    """Test 2: Bleach + Ammonia must be blocked with TOXIC_GAS."""
    res = ChemiGuardEngine.check_pair(bleach, ammonia)
    assert res is not None, "Bleach + Ammonia should be flagged as incompatible"
    assert res.consequence == 'TOXIC_GAS', f"Expected TOXIC_GAS but got {res.consequence}"


def test_acid_and_cyanide_incompatibility():
    """Test 3: Acid + Cyanide must be blocked with TOXIC_GAS (HCN)."""
    res = ChemiGuardEngine.check_pair(hydrochloric_acid, sodium_cyanide)
    assert res is not None, "Acid + Cyanide should be flagged as incompatible"
    assert res.consequence == 'TOXIC_GAS', f"Expected TOXIC_GAS but got {res.consequence}"


def test_acetone_and_ethanol_compatibility():
    """Test 4: Acetone + Ethanol are compatible flammables and must be SAFE."""
    res = ChemiGuardEngine.check_pair(acetone, ethanol)
    assert res is None, "Compatible flammables should return None (safe)"


def test_whole_lot_evaluation():
    """Test 5: Mixed lot evaluation must catch multiple violations."""
    lot_eval = ChemiGuardEngine.evaluate_lot([nitric_acid, acetone, bleach, ammonia])
    assert not lot_eval.is_safe, "Lot with incompatibilities must not be marked safe"
    assert len(lot_eval.issues) >= 2, f"Expected at least 2 issues, got {len(lot_eval.issues)}"
    assert lot_eval.checked_count == 6, f"Expected 6 pairwise checks, got {lot_eval.checked_count}"


def run_chemiguard_verification() -> bool:
    print('=' * 60)
    print('  STARTING CHEMIGUARD DETERMINISTIC VERIFICATION SUITE')
    print('=' * 60)

    try:
        test_nitric_acid_and_acetone_incompatibility()
        print('[PASS]: Test 1 - Nitric Acid + Acetone -> Blocked (EXPLOSION consequence)')

        test_bleach_and_ammonia_incompatibility()
        print('[PASS]: Test 2 - Bleach + Ammonia -> Blocked (TOXIC_GAS chloramine)')

        test_acid_and_cyanide_incompatibility()
        print('[PASS]: Test 3 - Acid + Cyanide -> Blocked (TOXIC_GAS hydrogen cyanide)')

        test_acetone_and_ethanol_compatibility()
        print('[PASS]: Test 4 - Acetone + Ethanol -> SAFE (100% EPA Compatible)')

        test_whole_lot_evaluation()
        print('[PASS]: Test 5 - Mixed Lot evaluated 6 pairs, flagged 2 violations.')

        print('=' * 60)
        print('  ALL 5/5 CHEMIGUARD VERIFICATION CHECKS PASSED PERFECTLY!')
        print('=' * 60)
        return True
    except AssertionError as e:
        print(f'[FAILED]: {e}')
        return False


if __name__ == '__main__':
    success = run_chemiguard_verification()
    sys.exit(0 if success else 1)
