@echo off
echo 🚀 OneGotchi Fight Arena - Deployment Script
echo =============================================
echo.

cd onegotchi-move\one_pet
if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to Move directory
    exit /b 1
)

echo 📦 Step 1: Building Move package...
one move build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check your Move code for errors.
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 📤 Step 2: Ready to deploy to OneChain...
echo.
echo Run this command to publish:
echo   one client publish --gas-budget 100000000
echo.
echo After deployment:
echo 1. Copy the Package ID from output
echo 2. Update evolvagotchi-frontend/src/config/onechain.ts
echo 3. Replace PACKAGE_ID with your new package ID
echo 4. Run 'npm run dev' in evolvagotchi-frontend/
echo.
echo 📖 See FIGHT_ARENA_GUIDE.md for detailed instructions

cd ..\..
