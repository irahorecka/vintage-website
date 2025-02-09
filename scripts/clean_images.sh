#!/bin/bash

# Try to find the vintage-website/scripts directory, fallback to the current directory if not found
BASE_DIR="$(find "$(pwd)" -type d -name 'vintage-website' -exec realpath {}/scripts \; 2>/dev/null | head -n 1)"
if [ -z "$BASE_DIR" ]; then
  echo "vintage-website/scripts not found. Falling back to the current directory."
  BASE_DIR="$(pwd)"
fi

# Define the target directories relative to BASE_DIR
AST_DIR="${BASE_DIR}/../backend/app/static/images/ast_storage"
COMICS_DIR="${BASE_DIR}/../backend/app/static/images/comics_storage"

# Check if the directories exist and remove .png files
if [ -d "$AST_DIR" ]; then
  echo "Cleaning .png files in $AST_DIR..."
  find "$AST_DIR" -type f -name "*.png" -exec rm -f {} \;
else
  echo "Directory $AST_DIR does not exist."
fi

if [ -d "$COMICS_DIR" ]; then
  echo "Cleaning .png files in $COMICS_DIR..."
  find "$COMICS_DIR" -type f -name "*.png" -exec rm -f {} \;
else
  echo "Directory $COMICS_DIR does not exist."
fi

echo "Cleanup completed."
