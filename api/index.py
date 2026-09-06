import sys
import os

# Add the root project directory to the Python path so Vercel can find the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
