#!/bin/bash
echo "Building React app..."
npm install --legacy-peer-deps
npm run build
echo "Build complete!"
