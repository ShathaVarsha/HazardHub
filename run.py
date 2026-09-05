"""
HazardHub AI - Main CLI Entrypoint & Launcher
Usage:
    python run.py --test      # Runs ChemiGuard test suite
    python run.py             # Launches Streamlit web application
"""

import sys
import os
import subprocess
from engines.test_runner import run_chemiguard_verification


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print("=" * 60)
    print("  HAZARDHUB AI - AUTONOMOUS HAZMAT POOLING INFRASTRUCTURE")
    print("  EPA 40 CFR Part 264 & Offline Chain-of-Custody (Pure Python)")
    print("=" * 60)

    # Always verify deterministic engines first
    print("\n[1/2] Running ChemiGuard deterministic safety suite...")
    test_passed = run_chemiguard_verification()
    if not test_passed:
        print("\n[FAILED] ChemiGuard verification failed! Aborting launch.")
        sys.exit(1)

    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    if "--test" in sys.argv:
        print("\n[OK] Tests completed successfully (--test flag specified). Exiting.")
        sys.exit(0)

    print("\n[2/2] Launching HazardHub AI Streamlit Web Application...")
    app_path = os.path.join(os.path.dirname(__file__), "app.py")

    cmd = [sys.executable, "-m", "streamlit", "run", app_path]
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nShutting down HazardHub AI application.")


if __name__ == "__main__":
    main()
