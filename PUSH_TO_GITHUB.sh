#!/bin/bash
# Script to push Fex TV to GitHub

echo "🚀 Pushing Fex TV to GitHub..."
echo ""

# Add remote (if not already added)
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Neenu1234/fex-tv.git

echo "✅ Remote added: https://github.com/Neenu1234/fex-tv.git"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Check your repo at: https://github.com/Neenu1234/fex-tv"

