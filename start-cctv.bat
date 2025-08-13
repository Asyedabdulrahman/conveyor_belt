@echo off
echo Starting CCTV Streaming System...
echo.

echo Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
start "CCTV Backend Server" cmd /k "npm start"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

cd ..

echo.
echo Starting frontend development server...
start "CCTV Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo CCTV Streaming System Started!
echo ========================================
echo Backend Server: http://localhost:3001
echo Frontend Dashboard: http://localhost:5173
echo.
echo IMPORTANT: Make sure to:
echo 1. Install FFmpeg and add to PATH
echo 2. Update camera IPs in server/app.js
echo 3. Test camera connections
echo.
echo Press any key to open setup guide...
pause > nul
start CCTV_SETUP_GUIDE.md
