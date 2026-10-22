@echo off
setlocal
cd /d "%~dp0"
if not exist "ar-verify.html" (
 echo [ERROR] Extract the ZIP fully, then run this file from the extracted folder.
 pause
 exit /b 1
)
where py >nul 2>&1
if not errorlevel 1 (
 set "PYTHON_CMD=py -3"
 goto START_SERVER
)
where python >nul 2>&1
if not errorlevel 1 (
 set "PYTHON_CMD=python"
 goto START_SERVER
)
echo [ERROR] Python not installed. Install Python or deploy via GitHub Pages (HTTPS).
pause
exit /b 1
:START_SERVER
start "CONIC LAB local web server" cmd /k "%PYTHON_CMD% -m http.server 8765 --bind 127.0.0.1"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8765/ar-verify.html"
echo [INFO] If the page appears unavailable, refresh in 2 seconds.
echo [INFO] Camera permission and internet access for AR.js are required.
endlocal
