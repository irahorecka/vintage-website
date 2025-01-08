#!/bin/bash

# Set the base directory
BASE_DIR="../backend/app/static/images"

# Define the target directories
AST_DIR="$BASE_DIR/ast_storage"
COMICS_DIR="$BASE_DIR/comics_storage"

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
