#!/bin/bash

# Base URL of the images
BASE_URL="https://www.cosmic-symbolism.com/images/TRIAL7/"

# Number of images to download
START_INDEX=1
END_INDEX=38

# Loop through the range and download each image
for i in $(seq $START_INDEX $END_INDEX); do
    # Construct the full URL
    IMAGE_URL="${BASE_URL}${i}.jpg"

    # Destination file name
    DESTINATION_FILE="${i}.jpg"

    # Download the image
    curl -o "$DESTINATION_FILE" "$IMAGE_URL"

    # Check if the download was successful
    if [ $? -eq 0 ]; then
        echo "Image ${i}.jpg downloaded successfully."
    else
        echo "Failed to download image ${i}.jpg."
    fi
done