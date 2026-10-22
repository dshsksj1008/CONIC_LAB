@echo off
setlocal
cd /d "%~dp0"
if not exist "index.html" (
  echo [ERROR] index.html not found. Extract the ZIP completely first.
  pause
  exit /b 1
)
start "" "%~dp0index.html"
endlocal
