@echo off
echo ====================================
echo ML MODELS EXECUTION SCRIPT
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo Step 1: Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Generating training data...
python data_generator.py
if errorlevel 1 (
    echo ERROR: Failed to generate data
    pause
    exit /b 1
)
echo.

echo Step 3: Training all ML models...
python train_models.py
if errorlevel 1 (
    echo ERROR: Failed to train models
    pause
    exit /b 1
)
echo.

echo Step 4: Creating visualization charts...
python visualize_results.py
if errorlevel 1 (
    echo ERROR: Failed to create visualizations
    pause
    exit /b 1
)
echo.

echo ====================================
echo ALL STEPS COMPLETED SUCCESSFULLY!
echo ====================================
echo.
echo Output files created:
echo - student_scores.csv (training data)
echo - model_results.json (metrics)
echo - *.pkl files (trained models)
echo - model_comparison_charts.png (visualization)
echo.
pause
