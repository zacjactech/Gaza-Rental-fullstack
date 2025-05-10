#!/bin/bash

# Gaza-Rental-Website Cleanup Script

echo "🧹 Cleaning up Gaza-Rental-Website project..."

# Remove build artifacts
echo "Removing Next.js build artifacts..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Removed .next directory"
fi

# Remove cache
if [ -d ".cache" ]; then
    rm -rf .cache
    echo "✅ Removed .cache directory"
fi

# Remove any temporary files
echo "Removing temporary files..."
rm -f *.tmp *.log temp.txt

# Clean node_modules (optional - commented out by default)
# echo "Removing node_modules..."
# if [ -d "node_modules" ]; then
#     rm -rf node_modules
#     echo "✅ Removed node_modules directory"
# fi

echo "✅ Cleanup complete!"
echo
echo "🚀 To reinstall dependencies, run: npm install"
echo "🔨 To rebuild the project, run: npm run build" 