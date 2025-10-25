#!/bin/bash

# Playwright Test Runner Script for ChemConcept Bridge
# This script helps you run different types of tests easily

echo "🧪 ChemConcept Bridge - Playwright Test Runner"
echo "=============================================="

# Function to check if servers are running
check_servers() {
    echo "🔍 Checking if servers are running..."
    
    # Check frontend server
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend server is running on port 3000"
    else
        echo "❌ Frontend server is not running on port 3000"
        echo "   Please run: cd frontend && npm start"
        return 1
    fi
    
    # Check backend server
    if curl -s http://localhost:5000 > /dev/null; then
        echo "✅ Backend server is running on port 5000"
    else
        echo "❌ Backend server is not running on port 5000"
        echo "   Please run: cd backend && npm start"
        return 1
    fi
    
    return 0
}

# Function to run tests
run_tests() {
    local test_type=$1
    local browser=$2
    
    echo "🚀 Running $test_type tests..."
    
    case $test_type in
        "smoke")
            npx playwright test smoke.spec.js ${browser:+--project=$browser}
            ;;
        "auth")
            npx playwright test auth.spec.js ${browser:+--project=$browser}
            ;;
        "features")
            npx playwright test features.spec.js ${browser:+--project=$browser}
            ;;
        "utils")
            npx playwright test utils.spec.js ${browser:+--project=$browser}
            ;;
        "all")
            npx playwright test ${browser:+--project=$browser}
            ;;
        *)
            echo "❌ Unknown test type: $test_type"
            echo "Available types: smoke, auth, features, utils, all"
            return 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --test TYPE     Test type (smoke, auth, features, utils, all)"
    echo "  -b, --browser TYPE  Browser (chromium, firefox, webkit)"
    echo "  -h, --help         Show this help message"
    echo "  --ui               Run tests with UI"
    echo "  --headed           Run tests in headed mode"
    echo "  --debug            Run tests in debug mode"
    echo ""
    echo "Examples:"
    echo "  $0 -t smoke                    # Run smoke tests"
    echo "  $0 -t auth -b chromium         # Run auth tests in Chrome"
    echo "  $0 -t all --ui                # Run all tests with UI"
    echo "  $0 -t features --headed        # Run feature tests in headed mode"
    echo "  $0 -t utils --debug           # Run utility tests in debug mode"
}

# Parse command line arguments
TEST_TYPE="all"
BROWSER=""
UI_MODE=""
HEADED_MODE=""
DEBUG_MODE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--test)
            TEST_TYPE="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        --ui)
            UI_MODE="--ui"
            shift
            ;;
        --headed)
            HEADED_MODE="--headed"
            shift
            ;;
        --debug)
            DEBUG_MODE="--debug"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
echo "📋 Test Configuration:"
echo "   Test Type: $TEST_TYPE"
echo "   Browser: ${BROWSER:-all}"
echo "   UI Mode: ${UI_MODE:+enabled}"
echo "   Headed Mode: ${HEADED_MODE:+enabled}"
echo "   Debug Mode: ${DEBUG_MODE:+enabled}"
echo ""

# Check if we're in the right directory
if [ ! -f "playwright.config.js" ]; then
    echo "❌ playwright.config.js not found. Please run this script from the frontend directory."
    exit 1
fi

# Check servers unless in debug mode
if [ -z "$DEBUG_MODE" ]; then
    if ! check_servers; then
        echo ""
        echo "💡 Tip: You can run tests in debug mode to skip server checks:"
        echo "   $0 --debug"
        exit 1
    fi
fi

echo ""
echo "🎯 Starting tests..."

# Build the command
CMD="npx playwright test"

if [ "$TEST_TYPE" != "all" ]; then
    CMD="$CMD $TEST_TYPE.spec.js"
fi

if [ -n "$BROWSER" ]; then
    CMD="$CMD --project=$BROWSER"
fi

if [ -n "$UI_MODE" ]; then
    CMD="$CMD $UI_MODE"
fi

if [ -n "$HEADED_MODE" ]; then
    CMD="$CMD $HEADED_MODE"
fi

if [ -n "$DEBUG_MODE" ]; then
    CMD="$CMD $DEBUG_MODE"
fi

echo "🔧 Executing: $CMD"
echo ""

# Run the tests
eval $CMD

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
    echo "📊 View detailed report: npm run test:e2e:report"
else
    echo ""
    echo "❌ Some tests failed!"
    echo "📊 View detailed report: npm run test:e2e:report"
    echo "🔍 Check screenshots and videos in test-results/ directory"
fi
