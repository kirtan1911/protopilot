@echo off
REM ============================================================
REM  ProtoPilot — Backend Startup Script
REM  Run this file from: c:\...\ProtoPilot\app\backend\
REM ============================================================
REM
REM  CORRECT command:   uvicorn server:app  (module = server.py)
REM  WRONG command:     uvicorn app.server:app  (no 'app' package here)
REM
REM  The CWD must be the directory containing server.py.
REM  When CWD = app\backend\, the module name is just "server".
REM ============================================================

echo Starting ProtoPilot backend on http://localhost:8000 ...
echo.

uvicorn server:app --host 0.0.0.0 --port 8000 --reload

pause
