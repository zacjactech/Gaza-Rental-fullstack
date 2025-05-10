@echo off
echo 🧹 Cleaning up Gaza-Rental-Website project...

REM Remove build artifacts
echo Removing Next.js build artifacts...
if exist .next (
    rmdir /s /q .next
    echo ✅ Removed .next directory
)

REM Remove cache
if exist .cache (
    rmdir /s /q .cache
    echo ✅ Removed .cache directory
)

REM Remove any temporary files
echo Removing temporary files...
if exist *.tmp del *.tmp
if exist *.log del *.log
if exist temp.txt del temp.txt

REM Clean node_modules (optional - commented out by default)
REM echo Removing node_modules...
REM if exist node_modules (
REM     rmdir /s /q node_modules
REM     echo ✅ Removed node_modules directory
REM )

echo ✅ Cleanup complete!
echo.
echo 🚀 To reinstall dependencies, run: npm install
echo 🔨 To rebuild the project, run: npm run build 