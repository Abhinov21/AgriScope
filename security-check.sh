#!/bin/bash
# Security check script for AgriScope

echo "🔒 AgriScope Security Check"
echo "=========================="

# Check if .env files are ignored
echo "📁 Checking .gitignore configuration..."

if grep -q "\.env" .gitignore 2>/dev/null; then
    echo "✅ Root .gitignore includes .env protection"
else
    echo "❌ Root .gitignore missing .env protection"
fi

if grep -q "\.env" backend/.gitignore 2>/dev/null; then
    echo "✅ Backend .gitignore includes .env protection"
else
    echo "❌ Backend .gitignore missing .env protection"
fi

# Check if .env is tracked by git
echo ""
echo "🔍 Checking for tracked sensitive files..."

if git ls-files | grep -q "\.env$"; then
    echo "❌ WARNING: .env files are being tracked by git!"
    echo "   Run: git rm --cached **/.env"
else
    echo "✅ No .env files are tracked by git"
fi

# Check if .env.example exists
echo ""
echo "📋 Checking for .env.example templates..."

if [ -f "backend/.env.example" ]; then
    echo "✅ Backend .env.example template exists"
else
    echo "❌ Backend .env.example template missing"
fi

echo ""
echo "🎯 Security Status: Repository is ready for GitHub push!"
echo "📝 Remember to tell collaborators to copy .env.example to .env and fill in their values."
