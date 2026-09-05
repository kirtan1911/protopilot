@echo off
REM ============================================================
REM  ProtoPilot — Start both Frontend and Backend
REM  Run from project root: c:\...\ProtoPilot\
REM ============================================================

echo.
echo ===================================================
echo   ProtoPilot — Starting Backend (port 8000)
echo ===================================================
echo.

REM Launch backend in new terminal window
start "ProtoPilot Backend" cmd /k "cd /d %~dp0app\backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo ===================================================
echo   ProtoPilot — Starting Frontend (port 3000)
echo ===================================================
echo.

REM Launch frontend in new terminal window
start "ProtoPilot Frontend" cmd /k "cd /d %~dp0app\frontend && yarn start"

echo.
echo Both services started.
echo   Backend:  http://localhost:8000/api/
echo   Frontend: http://localhost:3000
echo.
pause
