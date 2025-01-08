#!/bin/bash

# Define variables
SCRIPT_DIR=$(pwd)                   # Directory where the script is executed
FRONTEND_DIR="$SCRIPT_DIR/../frontend" # Path to the frontend directory
BUILD_DIR="$FRONTEND_DIR/dist"      # Default Vite build output directory
DEPLOY_DIR="/var/www/frontend"      # Nginx frontend directory

# Ensure nvm is loaded
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
else
  echo "Error: nvm is not installed or cannot be found."
  exit 1
fi

# Switch to Node.js version 16
echo "Switching to Node.js version 16..."
nvm use 16
if [ $? -ne 0 ]; then
  echo "Error: Failed to switch to Node.js version 16."
  exit 1
fi

# Navigate to the frontend directory
if [ -d "$FRONTEND_DIR" ]; then
  cd "$FRONTEND_DIR" || exit 1
else
  echo "Error: Frontend directory not found at $FRONTEND_DIR."
  exit 1
fi

# Build the frontend
echo "Building the frontend..."
npm install  # Ensure dependencies are installed
npm run build
if [ $? -ne 0 ]; then
  echo "Error: Frontend build failed."
  exit 1
fi

# Deploy the built files
echo "Deploying frontend to $DEPLOY_DIR..."
sudo rm -rf "$DEPLOY_DIR"/*  # Clear the existing frontend directory
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to copy frontend files to $DEPLOY_DIR."
  exit 1
fi

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx
if [ $? -ne 0 ]; then
  echo "Error: Failed to restart Nginx."
  exit 1
fi

echo "Frontend build and deployment completed successfully!"

