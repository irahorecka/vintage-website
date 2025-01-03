#!/bin/bash

# Define variables for paths and services
BACKEND_DIR="/home/irahorecka/vintage-website/backend"
FRONTEND_DIR="/var/www/frontend"
NGINX_CONF_DIR="/etc/nginx/conf.d"
SYSTEMD_BACKEND_SERVICE="fastapi.service"

# Function to start the backend
start_backend() {
  echo "Starting backend (FastAPI)..."

  # Activate the Python virtual environment
  if [ -f "$BACKEND_DIR/venv/bin/activate" ]; then
    source "$BACKEND_DIR/venv/bin/activate"
    echo "Virtual environment activated."

    # Start the FastAPI server
    nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$BACKEND_DIR/backend.log" 2>&1 &
    echo "FastAPI backend started and running on port 8000."
  else
    echo "Error: Virtual environment not found at $BACKEND_DIR/venv/bin/activate."
    exit 1
  fi
}

# Function to configure and restart Nginx
configure_nginx() {
  echo "Configuring Nginx for frontend and backend..."

  # Ensure Nginx configuration exists
  if [ -f "$NGINX_CONF_DIR/frontend.conf" ]; then
    echo "Nginx configuration found. Testing configuration..."
    sudo nginx -t
    if [ $? -eq 0 ]; then
      echo "Nginx configuration is valid. Reloading Nginx..."
      sudo systemctl reload nginx
      echo "Nginx reloaded successfully."
    else
      echo "Error: Nginx configuration test failed."
      exit 1
    fi
  else
    echo "Error: Nginx configuration file not found at $NGINX_CONF_DIR/frontend.conf."
    exit 1
  fi
}

# Function to ensure the frontend files are in place
start_frontend() {
  echo "Ensuring frontend files are in place at $FRONTEND_DIR..."
  if [ -d "$FRONTEND_DIR" ]; then
    echo "Frontend directory exists. No action required."
  else
    echo "Error: Frontend directory not found at $FRONTEND_DIR."
    exit 1
  fi
}

# Main script execution
echo "Starting system reconfiguration..."
start_backend
configure_nginx
start_frontend
echo "System reconfiguration complete. Backend and frontend are running."

