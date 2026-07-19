@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/

echo Building Normal Map Converter...
echo.
call npm install
if %errorlevel% neq 0 ( echo npm install failed & pause & exit /b 1 )
echo.
call npm run build
if %errorlevel% neq 0 ( echo Build failed & pause & exit /b 1 )
echo.
echo Done! Output: dist\NormalMapConverter.exe
explorer dist
pause
