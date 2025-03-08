#!/bin/bash

# Script to download placeholder images for the picluxe blog
# This script downloads sample images from Lorem Picsum for development purposes

echo "Downloading placeholder images for picluxe blog..."

# Create directories if they don't exist
mkdir -p ../public/blog
mkdir -p ../public/avatars

# Download blog post cover images
echo "Downloading blog post cover images..."
for i in {1..6}
do
  echo "Downloading post-$i.jpg..."
  curl -L "https://picsum.photos/800/450?random=$i" -o "../public/blog/post-$i.jpg"
  sleep 1 # Avoid rate limiting
done

# Download author avatars
echo "Downloading author avatars..."
for i in {1..6}
do
  echo "Downloading avatar-$i.jpg..."
  curl -L "https://picsum.photos/200/200?random=$((i+10))" -o "../public/avatars/avatar-$i.jpg"
  sleep 1 # Avoid rate limiting
done

echo "All placeholder images have been downloaded!"
echo "Note: For production, replace these placeholder images with real content." 