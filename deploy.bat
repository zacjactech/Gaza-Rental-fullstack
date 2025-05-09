@echo off
echo 🚀 Starting deployment process for Gaza-Rental-Website...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    call npm install -g vercel
)

REM Check environment variables
echo 🔍 Checking environment variables...
call npm run check-env
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Environment check failed. Please fix the issues before deploying.
    exit /b 1
)

REM Check for git repository
if exist .git (
    REM Check for uncommitted changes
    git status --porcelain > temp.txt
    set /p CHANGES=<temp.txt
    del temp.txt
    
    if defined CHANGES (
        echo ⚠️ You have uncommitted changes. Commit them before deploying? (y/n)
        set /p ANSWER=
        if /i "%ANSWER%"=="y" (
            echo Enter commit message:
            set /p MESSAGE=
            git add .
            git commit -m "%MESSAGE%"
        )
    )
)

REM Set environment to production
set NODE_ENV=production

REM Build the project
echo 🔨 Building project...
call npm run build

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment complete! Check your Vercel dashboard for details. 