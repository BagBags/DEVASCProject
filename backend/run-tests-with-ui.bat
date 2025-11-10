@echo off
echo ========================================
echo   JUANDER AUTOMATED TESTING
echo ========================================
echo.
echo Running tests...
echo.

call npm test

echo.
echo ========================================
echo   Opening Test Dashboard...
echo ========================================
echo.

start test-dashboard.html

echo.
echo Dashboard opened in your browser!
echo.
pause
