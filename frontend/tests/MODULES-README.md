# Test Modules - Separate Dashboards for Each Functionality

This directory contains 6 separate test modules, one for each functionality. Each module can be run independently and generates its own HTML report.

## Test Modules

1. **Module 1: Login** (`module-1-login.spec.js`)
   - Tests login functionality with valid credentials
   - Verifies redirect to dashboard after successful login

2. **Module 2: Registration** (`module-2-register.spec.js`)
   - Tests user registration flow
   - Verifies form validation and submission

3. **Module 3: Concepts** (`module-3-concepts.spec.js`)
   - Tests concept page navigation and interaction
   - Verifies concept display and details

4. **Module 4: Quiz and Scoring** (`module-4-quiz-scoring.spec.js`)
   - Tests quiz taking functionality
   - Verifies scoring and results display

5. **Module 5: AI Misconception Detector** (`module-5-misconception.spec.js`)
   - Tests AI-powered misconception detection
   - Verifies analysis results and feedback

6. **Module 6: Performance Dashboard** (`module-6-performance.spec.js`)
   - Tests performance metrics display
   - Verifies charts and visualizations

## Running Tests

### Prerequisites
1. **Backend server must be running** on `http://localhost:10000`
2. Frontend will auto-start on `http://localhost:3002` (or use existing server)

### Run Individual Modules

```bash
# Module 1: Login
npm run test:module1

# Module 2: Registration
npm run test:module2

# Module 3: Concepts
npm run test:module3

# Module 4: Quiz and Scoring
npm run test:module4

# Module 5: AI Misconception Detector
npm run test:module5

# Module 6: Performance Dashboard
npm run test:module6
```

### Run All Modules

```bash
npm run test:all-modules
```

### View Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

The report will open in your browser showing:
- Test results for each module
- Step-by-step execution details
- Screenshots and videos for failed tests
- Execution time and status

## Test Credentials

All tests use the following credentials:
- **Email**: `tessasaji2026@mca.ajce.in`
- **Password**: `Tessa@12345`

## Report Structure

Each module generates a separate section in the HTML report with:
- **Test Case ID**: Module number and test name
- **Steps**: Detailed step-by-step execution
- **Status**: Pass/Fail for each step
- **Screenshots**: Captured on failure
- **Videos**: Recorded for failed tests
- **Execution Time**: Duration for each step

## Troubleshooting

1. **Backend Connection Errors**: Ensure backend is running on port 10000
2. **Login Timeouts**: Check if credentials are correct and backend is accessible
3. **Element Not Found**: The app UI may have changed - update selectors in test files
4. **Memory Issues**: Tests run on Chromium only to reduce memory usage

## Notes

- Tests are configured to run on Chromium browser only for faster execution
- Each test clears storage before running to ensure clean state
- Tests wait for network idle to ensure pages are fully loaded
- Flexible selectors are used to handle UI variations


