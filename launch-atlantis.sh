#!/bin/bash

# ATLANTIS Hand Tracking Kiosk Launch Script
echo "Starting ATLANTIS Hand Tracking Kiosk..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
echo "Checking dependencies..."
python3 -c "import mediapipe, flask, cv2" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Launch the application in production mode
echo "Launching ATLANTIS in production mode..."
python3 main.py --production --kiosk

# Deactivate virtual environment on exit
deactivate

echo "ATLANTIS shutdown complete."