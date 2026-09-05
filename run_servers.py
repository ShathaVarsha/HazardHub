import subprocess
import sys
import os
import time

def main():
    print("Starting HazardHub AI (FastAPI + React)")
    print("="*40)
    
    # 1. Start FastAPI Backend
    print("-> Starting FastAPI Backend on port 8000...")
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=os.getcwd()
    )
    
    # Give backend a second to start
    time.sleep(2)
    
    # 2. Start Vite Frontend
    print("-> Starting Vite React Frontend...")
    # Use npx vite to skip server.ts and just serve the React app
    frontend_dir = os.path.join(os.getcwd(), "frontend")
    npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
    
    frontend = subprocess.Popen(
        [npx_cmd, "vite"],
        cwd=frontend_dir
    )
    
    print(">>> HazardHub AI is running! <<<")
    print("Backend API: http://localhost:8000")
    print("Frontend UI: http://localhost:5173")
    print("Press Ctrl+C to stop both servers.")
    print("="*40 + "\n")
    
    try:
        backend.wait()
        frontend.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend.terminate()
        frontend.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
