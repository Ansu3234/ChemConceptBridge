@echo off
REM Playwright Test Runner Script for ChemConcept Bridge (Windows)
REM This script helps you run different types of tests easily

echo 🧪 ChemConcept Bridge - Playwright Test Runner
echo ==============================================

REM Function to check if servers are running
:check_servers
echo 🔍 Checking if servers are running...

REM Check frontend server
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend server is running on port 3000
) else (
    echo ❌ Frontend server is not running on port 3000
    echo    Please run: cd frontend ^&^& npm start
    exit /b 1
)

REM Check backend server
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is running on port 5000
) else (
    echo ❌ Backend server is not running on port 5000
    echo    Please run: cd backend ^&^& npm start
    exit /b 1
)

exit /b 0

REM Function to show help
:show_help
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -t, --test TYPE     Test type (smoke, auth, features, utils, all)
echo   -b, --browser TYPE  Browser (chromium, firefox, webkit)
echo   -h, --help         Show this help message
echo   --ui               Run tests with UI
echo   --headed           Run tests in headed mode
echo   --debug            Run tests in debug mode
echo.
echo Examples:
echo   %0 -t smoke                    # Run smoke tests
echo   %0 -t auth -b chromium         # Run auth tests in Chrome
echo   %0 -t all --ui                # Run all tests with UI
echo   %0 -t features --headed        # Run feature tests in headed mode
echo   %0 -t utils --debug           # Run utility tests in debug mode
exit /b 0

REM Parse command line arguments
set TEST_TYPE=all
set BROWSER=
set UI_MODE=
set HEADED_MODE=
set DEBUG_MODE=

:parse_args
if "%~1"=="" goto main
if "%~1"=="-t" (
    set TEST_TYPE=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--test" (
    set TEST_TYPE=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-b" (
    set BROWSER=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--browser" (
    set BROWSER=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--ui" (
    set UI_MODE=--ui
    shift
    goto parse_args
)
if "%~1"=="--headed" (
    set HEADED_MODE=--headed
    shift
    goto parse_args
)
if "%~1"=="--debug" (
    set DEBUG_MODE=--debug
    shift
    goto parse_args
)
if "%~1"=="-h" goto show_help
if "%~1"=="--help" goto show_help
echo ❌ Unknown option: %~1
goto show_help

:main
echo 📋 Test Configuration:
echo    Test Type: %TEST_TYPE%
echo    Browser: %BROWSER%
echo    UI Mode: %UI_MODE%
echo    Headed Mode: %HEADED_MODE%
echo    Debug Mode: %DEBUG_MODE%
echo.

REM Check if we're in the right directory
if not exist "playwright.config.js" (
    echo ❌ playwright.config.js not found. Please run this script from the frontend directory.
    exit /b 1
)

REM Check servers unless in debug mode
if "%DEBUG_MODE%"=="" (
    call :check_servers
    if %errorlevel% neq 0 (
        echo.
        echo 💡 Tip: You can run tests in debug mode to skip server checks:
        echo    %0 --debug
        exit /b 1
    )
)

echo.
echo 🎯 Starting tests...

REM Build the command
set CMD=npx playwright test

if not "%TEST_TYPE%"=="all" (
    set CMD=%CMD% %TEST_TYPE%.spec.js
)

if not "%BROWSER%"=="" (
    set CMD=%CMD% --project=%BROWSER%
)

if not "%UI_MODE%"=="" (
    set CMD=%CMD% %UI_MODE%
)

if not "%HEADED_MODE%"=="" (
    set CMD=%CMD% %HEADED_MODE%
)

if not "%DEBUG_MODE%"=="" (
    set CMD=%CMD% %DEBUG_MODE%
)

echo 🔧 Executing: %CMD%
echo.

REM Run the tests
%CMD%

REM Check exit code
if %errorlevel% equ 0 (
    echo.
    echo ✅ All tests passed!
    echo 📊 View detailed report: npm run test:e2e:report
) else (
    echo.
    echo ❌ Some tests failed!
    echo 📊 View detailed report: npm run test:e2e:report
    echo 🔍 Check screenshots and videos in test-results/ directory
)

exit /b %errorlevel%
