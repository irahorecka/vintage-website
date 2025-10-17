#!/bin/bash

# Define variables
SCRIPT_DIR=$(pwd)                        # Directory where the script is executed (scripts/)
BACKEND_DIR="$SCRIPT_DIR/../backend"    # Path to the backend directory relative to scripts/
VENV_DIR="$BACKEND_DIR/venv"            # Virtual environment directory
SERVICE_NAME="fastapi.service"          # Systemd service name for FastAPI

# Navigate to the backend directory
if [ -d "$BACKEND_DIR" ]; then
  cd "$BACKEND_DIR" || exit 1
else
  echo "Error: Backend directory not found at $BACKEND_DIR."
  exit 1
fi

# Activate the virtual environment
if [ -f "$VENV_DIR/bin/activate" ]; then
  echo "Activating virtual environment..."
  source "$VENV_DIR/bin/activate"
else
  echo "Error: Virtual environment not found at $VENV_DIR/bin/activate."
  exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt
if [ $? -ne 0 ]; then
  echo "Error: Failed to install Python dependencies."
  deactivate
  exit 1
fi

# Deactivate virtual environment after installing dependencies
deactivate

# Restart the FastAPI backend service
echo "Restarting FastAPI backend service..."
sudo systemctl restart "$SERVICE_NAME"
if [ $? -ne 0 ]; then
  echo "Error: Failed to restart FastAPI backend service."
  exit 1
fi

echo "Backend build and deployment completed successfully!"
