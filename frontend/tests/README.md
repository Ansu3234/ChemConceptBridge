# Playwright Testing Setup for ChemConcept Bridge

This document provides a comprehensive guide for running Playwright tests on the ChemConcept Bridge project.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **MongoDB** (for backend testing)
4. **Backend server** running on port 5000
5. **Frontend server** running on port 3000

## Installation

Playwright has already been installed. If you need to reinstall:

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

## Test Structure

```
frontend/tests/
├── fixtures/
│   └── testData.js          # Test data and mock responses
├── utils/
│   └── testHelpers.js       # Utility functions for tests
├── screenshots/             # Screenshots from failed tests
├── smoke.spec.js           # Basic smoke tests
├── auth.spec.js            # Authentication flow tests
└── features.spec.js        # Core feature tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run only smoke tests
npx playwright test smoke.spec.js

# Run only authentication tests
npx playwright test auth.spec.js

# Run only feature tests
npx playwright test features.spec.js

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Running Tests in Different Modes

```bash
# Run tests in parallel (default)
npx playwright test

# Run tests sequentially
npx playwright test --workers=1

# Run tests with specific timeout
npx playwright test --timeout=60000

# Run tests with retries
npx playwright test --retries=3
```

## Test Configuration

The main configuration is in `playwright.config.js`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## Setting Up Test Environment

### 1. Start Backend Server

```bash
cd backend
npm start
```

Ensure MongoDB is running and the backend is accessible at `http://localhost:5000`.

### 2. Start Frontend Server

```bash
cd frontend
npm start
```

The frontend should be accessible at `http://localhost:3000`.

### 3. Seed Test Data (Optional)

```bash
cd backend
npm run seed
npm run seed-equations
npm run seed-students
```

## Test Data Management

### Mock Data

Tests use mock data from `tests/fixtures/testData.js`:

- **Test Users**: Admin, Teacher, Student accounts
- **Test Concepts**: Sample chemistry concepts
- **Test Quizzes**: Sample quiz questions
- **API Endpoints**: Mock API responses

### API Mocking

Tests mock API responses to avoid dependencies on backend:

```javascript
await mockApiResponse(page, '/api/auth/login', {
  token: 'mock-jwt-token',
  user: testUsers.student
});
```

## Writing New Tests

### 1. Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';
import { loginUser, clearStorage } from './utils/testHelpers.js';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Using Helper Functions

```javascript
// Login as specific user type
await loginUser(page, 'student');

// Clear browser storage
await clearStorage(page);

// Wait for API response
await waitForApiResponse(page, '/api/concepts');

// Take screenshot
await takeScreenshot(page, 'test-name');
```

### 3. Best Practices

- Use `data-testid` attributes for reliable element selection
- Mock API responses to avoid backend dependencies
- Clear storage between tests to ensure isolation
- Use descriptive test names
- Group related tests in `test.describe` blocks
- Use `test.beforeEach` for common setup

## Debugging Tests

### 1. Debug Mode

```bash
npx playwright test --debug
```

This opens the Playwright Inspector where you can:
- Step through tests
- Inspect elements
- View network requests
- Take screenshots

### 2. Headed Mode

```bash
npx playwright test --headed
```

Runs tests with visible browser windows.

### 3. Trace Viewer

```bash
npx playwright show-trace trace.zip
```

View detailed execution traces for failed tests.

### 4. Screenshots and Videos

Failed tests automatically capture:
- Screenshots
- Videos
- Traces

These are saved in `test-results/` directory.

## CI/CD Integration

### GitHub Actions

A GitHub Actions workflow is provided in `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: cd frontend && npm run test:e2e
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: frontend/playwright-report/
        retention-days: 30
```

## Troubleshooting

### Common Issues

1. **Tests fail with "Page not found"**
   - Ensure frontend server is running on port 3000
   - Check if the application is accessible in browser

2. **API calls fail**
   - Ensure backend server is running on port 5000
   - Check if MongoDB is connected
   - Verify API endpoints are working

3. **Element not found errors**
   - Check if selectors are correct
   - Add `data-testid` attributes to elements
   - Use `page.waitForSelector()` for dynamic content

4. **Authentication issues**
   - Clear browser storage between tests
   - Check if mock API responses are correct
   - Verify JWT token handling

### Performance Tips

1. **Parallel Execution**: Tests run in parallel by default
2. **Selective Testing**: Run only relevant tests during development
3. **Mock APIs**: Use mocks to avoid backend dependencies
4. **Page Objects**: Consider using page object pattern for complex pages

## Test Coverage

Current test coverage includes:

- ✅ **Smoke Tests**: Basic page loading and navigation
- ✅ **Authentication**: Login, registration, role-based access
- ✅ **Dashboard**: Student, teacher, admin dashboards
- ✅ **Quiz System**: Starting quizzes, answering questions, results
- ✅ **Concept Map**: Displaying concepts, interactions, completion
- ✅ **Navigation**: Between different sections

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use helper functions from `testHelpers.js`
3. Add test data to `testData.js` if needed
4. Update this documentation
5. Ensure tests pass locally before committing

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
