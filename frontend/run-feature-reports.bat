@echo off
setlocal enabledelayedexpansion
REM Generate separate Playwright HTML reports per feature

cd /d %~dp0

set REPORTS_DIR=reports
if not exist "%REPORTS_DIR%" mkdir "%REPORTS_DIR%"

REM Ensure Playwright is installed
where npx >nul 2>&1
if %errorlevel% neq 0 (
  echo ❌ Node.js / npx not found in PATH.
  exit /b 1
)

REM Function: run one spec and copy HTML report
REM Usage: call :run_spec SPEC_PATH REPORT_NAME
:run_spec
set SPEC=%~1
set NAME=%~2

echo.
echo ▶ Running %NAME% tests: %SPEC%

npx playwright test "%SPEC%"
if %errorlevel% neq 0 (
  echo ⚠️ Tests for %NAME% had failures. Report will still be saved.
)

REM Copy HTML report to dedicated folder
if not exist "%REPORTS_DIR%\%NAME%" mkdir "%REPORTS_DIR%\%NAME%"

REM Use robocopy if available (more reliable)
where robocopy >nul 2>&1
if %errorlevel% equ 0 (
  robocopy "playwright-report" "%REPORTS_DIR%\%NAME%" /MIR >nul
) else (
  xcopy /E /I /Y "playwright-report" "%REPORTS_DIR%\%NAME%" >nul
)

echo ✅ Saved report: %REPORTS_DIR%\%NAME%\index.html
exit /b 0

REM =====================
REM Run requested feature suites
REM =====================
call :run_spec tests\login.report.spec.js login
call :run_spec tests\register.report.spec.js register
call :run_spec tests\concept.report.spec.js concept
call :run_spec tests\quiz-scoring.report.spec.js quiz-scoring
call :run_spec tests\misconception.report.spec.js misconception
call :run_spec tests\performance.report.spec.js performance

echo.
echo 🎉 All feature runs completed.
echo 📁 Reports saved under: %REPORTS_DIR%\<feature>\index.html

echo To view a report: npx playwright show-report "%REPORTS_DIR%\login"
endlocal