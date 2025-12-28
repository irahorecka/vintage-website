#!/bin/bash

# Path to the script to be executed
SCRIPT_PATH="$(pwd)/clean_images.sh"

# Ensure the script exists
if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: Script $SCRIPT_PATH does not exist."
  exit 1
fi

# Add the cron job to the crontab
(crontab -l 2>/dev/null; echo "0 * * * * bash $SCRIPT_PATH") | crontab -

# Confirm the cron job is set
echo "Cron job added to run $SCRIPT_PATH every hour."
