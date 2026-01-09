# Quick Test Commands Reference

## Test User Credentials
```
Email: tessasaji2026@mca.ajce.in
Password: Tessa@12345
```

---

## Run All Real Tests
```bash
npx playwright test tests/real-*.spec.js
```

---

## Run Individual Modules

### 1. Login Tests
```bash
npx playwright test tests/real-login.spec.js
```

### 2. Dashboard Tests
```bash
npx playwright test tests/real-student-dashboard.spec.js
```

### 3. Concept Page Tests
```bash
npx playwright test tests/real-concepts.spec.js
```

### 4. Quiz & Scoring Tests
```bash
npx playwright test tests/real-quiz.spec.js
```

### 5. AI Misconception Detector Tests
```bash
npx playwright test tests/real-misconception-detector.spec.js
```

### 6. Logout Tests
```bash
npx playwright test tests/real-logout.spec.js
```

---

## View Test Results
```bash
npx playwright show-report
```

---

## Interactive Testing (UI Mode)
```bash
npx playwright test tests/real-*.spec.js --ui
```

---

## See Browser While Testing
```bash
npx playwright test tests/real-*.spec.js --headed
```

---

## Debug Mode
```bash
npx playwright test tests/real-*.spec.js --debug
```

---

## Run Specific Test
```bash
npx playwright test tests/real-login.spec.js -g "should login successfully"
```

---

## Run with Verbose Output
```bash
npx playwright test tests/real-*.spec.js --reporter=verbose
```

---

## Run with Specific Browser
```bash
# Chrome
npx playwright test tests/real-*.spec.js --project=chromium

# Firefox
npx playwright test tests/real-*.spec.js --project=firefox

# Safari
npx playwright test tests/real-*.spec.js --project=webkit
```

---

## Test Count
- **Login**: 6 tests
- **Dashboard**: 11 tests
- **Concepts**: 12 tests
- **Quiz**: 14 tests
- **Misconception Detector**: 13 tests
- **Logout**: 10 tests
- **TOTAL**: 66 tests

---

## Setup
```bash
# 1. Install dependencies
npm install

# 2. Install browsers
npx playwright install

# 3. Make sure backend is running
# Terminal 1: cd backend && npm start

# 4. Make sure frontend is running
# Terminal 2: cd frontend && npm start

# 5. Run tests
npx playwright test tests/real-*.spec.js
```

---

## Troubleshooting Commands

### View specific test file
```bash
cat tests/real-login.spec.js
```

### Check if browsers are installed
```bash
npx playwright install-deps
```

### Clear Playwright cache
```bash
npx playwright clean
```

### List all tests without running
```bash
npx playwright test tests/real-*.spec.js --list
```

---

## Test Reports
After running tests, reports are saved in:
- **HTML Report**: `playwright-report/`
- **Test Results**: `test-results/`
- **Screenshots**: `test-results/` (for failed tests)
- **Videos**: `test-results/` (for failed tests)

---

## File Locations
- Login tests: `frontend/tests/real-login.spec.js`
- Dashboard tests: `frontend/tests/real-student-dashboard.spec.js`
- Concept tests: `frontend/tests/real-concepts.spec.js`
- Quiz tests: `frontend/tests/real-quiz.spec.js`
- Misconception tests: `frontend/tests/real-misconception-detector.spec.js`
- Logout tests: `frontend/tests/real-logout.spec.js`
- Guide: `frontend/REAL-TESTING-GUIDE.md`

---

## npm Scripts (from package.json)
```bash
npm run test:e2e                 # Run all tests
npm run test:e2e:ui             # Run with UI
npm run test:e2e:headed         # See browser
npm run test:e2e:debug          # Debug mode
npm run test:e2e:report         # View HTML report
```

---

## Example Workflow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Open new terminal in frontend directory
4. Run tests: `npx playwright test tests/real-*.spec.js --headed --ui`
5. View report: `npx playwright show-report`

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tests can't find elements | Use `--debug` and inspect UI |
| Login fails | Verify credentials and check API |
| Tests timeout | Increase timeout or check network |
| Port already in use | Kill process or use different port |
| Playwright not installed | Run `npx playwright install` |

---

For detailed information, see **REAL-TESTING-GUIDE.md**
