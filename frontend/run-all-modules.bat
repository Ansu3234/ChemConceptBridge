@echo off
echo ========================================
echo Running All 6 Test Modules
echo ========================================
echo.

echo [1/6] Running Module 1: Login...
call npm run test:module1
echo.

echo [2/6] Running Module 2: Registration...
call npm run test:module2
echo.

echo [3/6] Running Module 3: Concepts...
call npm run test:module3
echo.

echo [4/6] Running Module 4: Quiz and Scoring...
call npm run test:module4
echo.

echo [5/6] Running Module 5: AI Misconception...
call npm run test:module5
echo.

echo [6/6] Running Module 6: Performance Dashboard...
call npm run test:module6
echo.

echo ========================================
echo All modules completed!
echo ========================================
echo.
echo To view reports, run: npm run test:e2e:report
echo.

pause





