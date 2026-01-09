# Comprehensive Playwright Test Suite

This document describes the Playwright test suite for ChemConcept Bridge application modules.

## Test Coverage

### 1. **LOGIN MODULE** (auth.spec.js & comprehensive.spec.js)
- ✅ Load login page successfully
- ✅ Login with valid student/teacher/admin credentials
- ✅ Display error on invalid credentials
- ✅ Email format validation
- ✅ Disable login button while submitting
- ✅ Password visibility toggle
- ✅ Persist login across page reload
- ✅ Role-based access control

### 2. **REGISTER MODULE** (auth.spec.js & comprehensive.spec.js)
- ✅ Load register page successfully
- ✅ Register new student account
- ✅ Prevent duplicate email registration
- ✅ Validate password match/confirmation
- ✅ Password strength validation
- ✅ Email verification requirement
- ✅ Navigation to login after registration
- ✅ Link to login page from register

### 3. **CONCEPT PAGE MODULE** (features.spec.js & comprehensive.spec.js)
- ✅ Display concept list page
- ✅ Load individual concept details
- ✅ Track concept view
- ✅ Mark concept as complete
- ✅ Display concept prerequisites
- ✅ Show interactive visualizations
- ✅ Concept search functionality
- ✅ Filter concepts by category

### 4. **QUIZ & SCORING MODULE** (quiz-scoring.spec.js & comprehensive.spec.js)
- ✅ Display available quizzes
- ✅ Start quiz successfully
- ✅ Display quiz questions with options
- ✅ Answer quiz questions
- ✅ Display quiz progress
- ✅ Submit completed quiz
- ✅ Display quiz results with score
- ✅ Show detailed feedback for each question
- ✅ Track quiz attempt history
- ✅ Calculate score correctly
- ✅ Allow retaking quiz

### 5. **AI MISCONCEPTION DETECTOR MODULE** (misconception.spec.js & comprehensive.spec.js)
- ✅ Load misconception detector page
- ✅ Provide text input for student answer
- ✅ Analyze student answer for misconceptions
- ✅ Display misconception detection results
- ✅ Show confidence score
- ✅ Provide remediation suggestions
- ✅ Handle no misconception detected scenario
- ✅ Save analysis history
- ✅ Handle API errors gracefully
- ✅ Display model information

### 6. **SESSION & LOGOUT** (comprehensive.spec.js)
- ✅ Logout successfully
- ✅ Clear user session on logout
- ✅ Handle session timeout

## Running the Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test tests/login.spec.js
npx playwright test tests/register.spec.js
npx playwright test tests/concepts.spec.js
npx playwright test tests/quiz-scoring.spec.js
npx playwright test tests/misconception.spec.js
npx playwright test tests/comprehensive.spec.js
```

### Run specific test
```bash
npx playwright test tests/comprehensive.spec.js -g "should login with valid credentials"
```

### Debug mode
```bash
npm run test:e2e:debug
```

### Generate HTML report
```bash
npm run test:e2e:report
```

## Test Structure

Each test module follows this pattern:

```javascript
test.describe('MODULE NAME', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
    // Setup for each test
  });

  test('should perform specific action', async ({ page }) => {
    // Arrange - setup test data and mocks
    await mockApiResponse(page, endpoint, data);
    
    // Act - perform user actions
    await page.goto('/path');
    await page.fill('input[name="field"]', 'value');
    
    // Assert - verify results
    await expect(page).toHaveURL(/expected-url/);
    await expect(element).toBeVisible();
  });
});
```

## Key Testing Utilities

### Mock API Response
```javascript
await mockApiResponse(page, '/api/endpoint', {
  success: true,
  data: { /* response data */ }
});
```

### Login Helper
```javascript
await loginUser(page, 'student'); // 'admin', 'teacher'
```

### Clear Storage
```javascript
await clearStorage(page); // Clear localStorage and sessionStorage
```

### Wait for Element
```javascript
await waitForElement(page, selector, timeout);
```

### Fill Form
```javascript
await fillForm(page, {
  email: 'test@test.com',
  password: 'password123'
});
```

## Test Data

Test users and test data are defined in `fixtures/testData.js`:

- **Student**: admin@chemconcept.local / Admin@12345
- **Teacher**: teacher@test.com / teacher123
- **Admin**: admin@test.com / admin123

## Configuration

Tests are configured in `playwright.config.js`:

- **Base URL**: http://localhost:3002
- **Timeout**: 30000ms per action
- **Retry**: 2 times on CI, 0 times locally
- **Screenshots**: On failure
- **Videos**: On failure
- **Reporters**: HTML report

## Continuous Integration

Tests automatically run on:
- Pull requests
- Commits to main branch
- Manual trigger via GitHub Actions

See `.github/workflows/` for CI configuration.

## Best Practices

1. **Use data-testid attributes** in your components for reliable selectors
2. **Avoid hard waits** - use `waitForURL`, `waitForLoadState`, etc.
3. **Test user behavior** not implementation details
4. **Keep tests isolated** - clear storage before each test
5. **Use meaningful test descriptions** that explain the user scenario
6. **Mock external APIs** to avoid dependencies
7. **Use page.locator()** with flexible selectors for resilience

## Troubleshooting

### Tests fail locally but pass in CI
- Check that the app is running on http://localhost:3002
- Clear browser cache: `npx playwright clean`
- Check for hardcoded waits and replace with proper waits

### Selectors not found
- Use `npx playwright test --debug` to inspect elements
- Check that components have `data-testid` attributes
- Try using `page.locator()` with flexible CSS/XPath selectors

### API mocks not working
- Verify the exact API endpoint path
- Check response status codes (200 for success, 401 for auth errors)
- Ensure mock is set up before navigation

## Adding New Tests

1. Create a new `.spec.js` file in `tests/` directory
2. Import utilities from `utils/testHelpers.js`
3. Import test data from `fixtures/testData.js`
4. Follow the test structure pattern
5. Use meaningful test descriptions
6. Run `npm run test:e2e:ui` to test interactively

## Test Report

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

This opens an interactive report showing:
- Test results (passed/failed)
- Execution time
- Screenshots on failure
- Video recordings
- Trace files for debugging
