#!/bin/bash
# Vercel build script
echo "Starting build process..."

# Clean install with legacy peer deps
npm ci --legacy-peer-deps

# Build the project
npm run build

echo "Build completed successfully!"
