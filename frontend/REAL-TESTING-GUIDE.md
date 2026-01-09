# Real Testing Guide - Tessa Account

This guide explains how to run real end-to-end tests using actual credentials and the live application backend.

## Test User Credentials

- **Email**: tessasaji2026@mca.ajce.in
- **Password**: Tessa@12345
- **Base URL**: http://localhost:3002

## Test Files Overview

### 1. **real-login.spec.js** - Login Module Tests
Location: `frontend/tests/real-login.spec.js`

Tests the login functionality with real credentials:
- Load login page
- Login successfully with real credentials
- Check if token is stored
- Persist session after page reload
- Navigate to dashboard after login
- Display user information

**Run login tests:**
```bash
npx playwright test tests/real-login.spec.js
```

**Run specific test:**
```bash
npx playwright test tests/real-login.spec.js -g "should login successfully"
```

---

### 2. **real-student-dashboard.spec.js** - Dashboard Tests
Location: `frontend/tests/real-student-dashboard.spec.js`

Tests the student dashboard functionality:
- Display dashboard after login
- Display welcome message
- Display navigation menu
- Display progress section
- Display quiz section
- Display concept section
- Navigate to different pages
- Display user menu/profile
- Display dashboard cards and widgets
- Display statistics and metrics

**Run dashboard tests:**
```bash
npx playwright test tests/real-student-dashboard.spec.js
```

**Run specific test:**
```bash
npx playwright test tests/real-student-dashboard.spec.js -g "should display student dashboard"
```

---

### 3. **real-concepts.spec.js** - Concept Page Tests
Location: `frontend/tests/real-concepts.spec.js`

Tests the concept learning page:
- Navigate to concepts page
- Display concepts list
- Display concept title and description
- Click on concept to view details
- Display concept detail page
- Display concept content/description
- Show interactive visualizations
- Mark concept as complete
- Search concepts
- Filter concepts by category
- Display prerequisites
- Track concept view
- Navigate back from detail page

**Run concept tests:**
```bash
npx playwright test tests/real-concepts.spec.js
```

**Run specific test:**
```bash
npx playwright test tests/real-concepts.spec.js -g "should display concepts list"
```

---

### 4. **real-quiz.spec.js** - Quiz & Scoring Tests
Location: `frontend/tests/real-quiz.spec.js`

Tests the quiz and scoring functionality:
- Navigate to quiz page
- Display available quizzes
- Display quiz title and difficulty
- Click on quiz to start
- Start quiz and display first question
- Display quiz questions with options
- Answer quiz questions
- Navigate to next question
- Display quiz progress
- Submit quiz
- Display quiz results
- Display score
- Display feedback for answers
- Show correct/incorrect answers
- Allow retaking quiz
- Track quiz attempt history

**Run quiz tests:**
```bash
npx playwright test tests/real-quiz.spec.js
```

**Run specific test:**
```bash
npx playwright test tests/real-quiz.spec.js -g "should display available quizzes"
```

---

### 5. **real-misconception-detector.spec.js** - AI Misconception Detector Tests
Location: `frontend/tests/real-misconception-detector.spec.js`

Tests the AI-powered misconception detection:
- Navigate to misconception detector
- Display misconception detector page
- Display input field for student answer
- Accept student answer input
- Display analyze/detect button
- Analyze student answer for misconceptions
- Display misconception results
- Display misconception label/type
- Display confidence score
- Display explanation for misconception
- Provide remediation suggestions
- Handle correct answer without misconception
- Allow new analysis
- Display analysis history
- Display ML models information
- Handle API errors gracefully
- Display loading indicator while analyzing

**Run misconception detector tests:**
```bash
npx playwright test tests/real-misconception-detector.spec.js
```

**Run specific test:**
```bash
npx playwright test tests/real-misconception-detector.spec.js -g "should analyze student answer"
```

---

### 6. **real-logout.spec.js** - Logout & Session Tests
Location: `frontend/tests/real-logout.spec.js`

Tests logout and session management:
- Logout successfully
- Clear authentication token on logout
- Redirect to login after logout
- Prevent access to protected routes after logout
- Handle session timeout gracefully
- Maintain session with valid token
- Display user info before logout
- Have accessible logout button
- Logout from different pages
- Clear all session storage on logout

**Run logout tests:**
```bash
npx playwright test tests/real-logout.spec.js
```

**Run specific test:**
```bash
npx playwright test tests/real-logout.spec.js -g "should logout successfully"
```

---

## Running All Real Tests

### Run all real tests together:
```bash
npx playwright test tests/real-*.spec.js
```

### Run with UI mode (interactive):
```bash
npx playwright test tests/real-*.spec.js --ui
```

### Run in headed mode (see browser):
```bash
npx playwright test tests/real-*.spec.js --headed
```

### Run in debug mode:
```bash
npx playwright test tests/real-*.spec.js --debug
```

### Run with specific browser:
```bash
npx playwright test tests/real-*.spec.js --project=chromium
npx playwright test tests/real-*.spec.js --project=firefox
npx playwright test tests/real-*.spec.js --project=webkit
```

### Run with verbose output:
```bash
npx playwright test tests/real-*.spec.js --reporter=verbose
```

---

## Setup Requirements

### 1. Start the Application
Make sure both frontend and backend are running:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

The app should be accessible at **http://localhost:3002**

### 2. Check Backend is Running
Verify the API is accessible:
```bash
curl http://localhost:5000/api/health
```

### 3. Install Playwright Browsers (first time only)
```bash
npx playwright install
```

---

## Viewing Test Results

### After tests complete, view the HTML report:
```bash
npm run test:e2e:report
```

Or manually:
```bash
npx playwright show-report
```

### View test videos (for failed tests):
Videos are saved in `test-results/` directory

### View screenshots (for failed tests):
Screenshots are saved in `test-results/` directory

---

## Test Execution Order

**Recommended execution order:**

1. **real-login.spec.js** - Verify login works first
2. **real-student-dashboard.spec.js** - Verify dashboard loads
3. **real-concepts.spec.js** - Test concept pages
4. **real-quiz.spec.js** - Test quiz functionality
5. **real-misconception-detector.spec.js** - Test AI detector
6. **real-logout.spec.js** - Test logout (cleanup)

---

## Troubleshooting

### Issue: "Page is not available" or 404 errors

**Solution:**
- Make sure the backend is running
- Check that frontend is on http://localhost:3002
- Check network tab in browser DevTools
- Ensure all API endpoints are available

```bash
# Restart servers
npm start  # Both backend and frontend
```

### Issue: Tests timeout waiting for elements

**Solution:**
- Check if the application UI has changed
- Update selectors if component structure changed
- Increase timeout if API responses are slow
- Check browser console for JavaScript errors

### Issue: "element is not visible" errors

**Solution:**
- The element might be hidden or behind a modal
- Try scrolling to element: `await element.scrollIntoViewIfNeeded()`
- Check if there's a popup/modal blocking the element
- Try waiting longer: `await page.waitForTimeout(1000)`

### Issue: Flaky tests (sometimes pass, sometimes fail)

**Solution:**
- Don't use hard waits like `setTimeout`
- Use proper waits: `waitForLoadState()`, `waitForURL()`
- Wait for specific elements to appear
- Check for race conditions

```javascript
// Good
await page.waitForLoadState('networkidle');
await page.waitForURL(/dashboard/);

// Avoid
await page.waitForTimeout(2000);
```

### Issue: Login fails

**Solution:**
- Verify credentials are correct
- Check if the account is active/not locked
- Check API endpoint `/api/auth/login` is responding
- Verify JWT token is being stored in localStorage

```javascript
// In test, verify token:
const token = await page.evaluate(() => localStorage.getItem('token'));
console.log('Token:', token);
```

---

## Best Practices for Real Testing

### 1. **Independent Tests**
Each test should be able to run independently:
```javascript
test.beforeEach(async ({ page }) => {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
```

### 2. **Flexible Selectors**
Use flexible locators that work even if UI changes:
```javascript
// Good - multiple fallback selectors
const button = page.locator('button:has-text("Login"), button[aria-label="Login"], [data-testid="login-btn"]').first();

// Avoid - brittle selectors
const button = page.locator('.form > div:nth-child(3) > button');
```

### 3. **Wait for Ready State**
Always wait for network operations to complete:
```javascript
await page.click('button');
await page.waitForLoadState('networkidle');
```

### 4. **Meaningful Assertions**
Use clear, specific assertions:
```javascript
// Good
await expect(page).toHaveURL(/student-dashboard/);
await expect(heading).toBeVisible();

// Avoid
await expect(page).toBeTruthy();
```

### 5. **Error Handling**
Handle cases where elements might not exist:
```javascript
const element = page.locator('selector').first();
if (await element.isVisible()) {
  await expect(element).toBeVisible();
}
```

---

## Advanced: Creating Custom Test Scripts

### Run specific modules:
```bash
# Login tests only
npx playwright test tests/real-login.spec.js tests/real-logout.spec.js

# Dashboard and concept tests
npx playwright test tests/real-student-dashboard.spec.js tests/real-concepts.spec.js
```

### Run with specific configuration:
Create a custom config in `playwright-real.config.js`:
```javascript
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,  // Run tests sequentially
  retries: 1,
  use: {
    baseURL: 'http://localhost:3002',
    screenshot: 'on-failure',
    video: 'on-failure'
  }
});
```

Then run:
```bash
npx playwright test -c playwright-real.config.js
```

---

## CI/CD Integration

To run tests in CI/CD pipeline, add to `.github/workflows/test.yml`:

```yaml
- name: Run Real Tests
  run: |
    npm run test:e2e -- tests/real-*.spec.js
    
- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

---

## Summary

| Module | Tests | Command |
|--------|-------|---------|
| Login | 6 tests | `npx playwright test tests/real-login.spec.js` |
| Dashboard | 11 tests | `npx playwright test tests/real-student-dashboard.spec.js` |
| Concepts | 12 tests | `npx playwright test tests/real-concepts.spec.js` |
| Quiz | 14 tests | `npx playwright test tests/real-quiz.spec.js` |
| Misconception Detector | 13 tests | `npx playwright test tests/real-misconception-detector.spec.js` |
| Logout | 10 tests | `npx playwright test tests/real-logout.spec.js` |
| **TOTAL** | **66 tests** | `npx playwright test tests/real-*.spec.js` |

---

## Support

For issues or questions:
1. Check test output: `npx playwright test --reporter=verbose`
2. View debug trace: `npx playwright test --debug`
3. Check browser console in headed mode: `--headed`
4. Review test reports: `npm run test:e2e:report`
