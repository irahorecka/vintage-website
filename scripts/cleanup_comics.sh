#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define the target directory relative to the script's directory
TARGET_DIR="$SCRIPT_DIR/../backend/app/static/images/comics_storage"

# Define size thresholds (in MB)
UPPER_LIMIT=100
LOWER_LIMIT=75

# Check the current size of the directory
CURRENT_SIZE=$(du -sm "$TARGET_DIR" | cut -f1)

# If the directory size is greater than the upper limit, start cleanup
if [ "$CURRENT_SIZE" -gt "$UPPER_LIMIT" ]; then
  echo "Directory size is $CURRENT_SIZE MB, starting cleanup..."
  find "$TARGET_DIR" -type f -iname "*.png" -printf '%T+ %p\n' | sort | while read -r line; do
    # Extract the file path
    FILE=$(echo "$line" | cut -d' ' -f2)
    echo "Deleting file: $FILE"
    rm "$FILE"

    # Recalculate the size after deletion
    CURRENT_SIZE=$(du -sm "$TARGET_DIR" | cut -f1)

    # Stop if size is below the lower limit
    if [ "$CURRENT_SIZE" -le "$LOWER_LIMIT" ]; then
      echo "Cleanup complete. Directory size is now $CURRENT_SIZE MB."
      break
    fi
  done
else
  echo "Directory size is $CURRENT_SIZE MB, no cleanup needed."
fi
