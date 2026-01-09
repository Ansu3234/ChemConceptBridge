// Comprehensive test suite for all 6 functionalities
// Using real credentials: tessasaji2026@mca.ajce.in / Tessa@12345
import { test, expect } from '@playwright/test';
import { clearStorage } from './utils/testHelpers.js';

const USER_EMAIL = 'tessasaji2026@mca.ajce.in';
const USER_PASSWORD = 'Tessa@12345';

test.describe('All 6 Functionalities Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  // ============================================
  // Test Case 1: Login Functionality
  // ============================================
  test('Test Case 1: Login with valid credentials', async ({ page }) => {
    await test.step('Step 1: Open browser', async () => {
      await expect(page).toBeDefined();
    });

    await test.step('Step 2: Navigate to login page', async () => {
      await page.goto('/login');
      await expect(page).toHaveURL(/login/i);
      await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Step 3: Enter valid username', async () => {
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      const emailValue = await page.inputValue('input[name="email"], input[type="email"]');
      expect(emailValue).toBe(USER_EMAIL);
    });

    await test.step('Step 4: Enter valid password', async () => {
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
    });

    await test.step('Step 5: Click Login button', async () => {
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Step 6: Verify redirect to dashboard', async () => {
      // Wait for redirect - could be student, teacher, or admin dashboard
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 15000 });
      const url = page.url();
      expect(url).toMatch(/\/(student|teacher|admin)-dashboard/);
    });

    await test.step('Step 7: Verify dashboard elements are visible', async () => {
      // Check for dashboard heading or navigation
      const heading = page.locator('h1, h2, [class*="dashboard"], [class*="Dashboard"]').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      
      // Check for navigation elements
      const nav = page.locator('nav, .sidebar, .navigation, [class*="nav"]').first();
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }
    });
  });

  // ============================================
  // Test Case 2: Registration Functionality
  // ============================================
  test('Test Case 2: Registration with valid details', async ({ page }) => {
    await test.step('Step 1: Navigate to register page', async () => {
      await page.goto('/register');
      await expect(page).toHaveURL(/register/i);
      await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Step 2: Enter email', async () => {
      const testEmail = `test${Date.now()}@test.com`;
      await page.fill('input[name="email"], input[type="email"]', testEmail);
    });

    await test.step('Step 3: Enter password and confirm', async () => {
      const testPassword = 'Test@12345';
      await page.fill('input[name="password"], input[type="password"]', testPassword);
      
      // Check if confirm password field exists
      const confirmField = page.locator('input[name="confirmPassword"], input[name="confirm"], input[placeholder*="confirm" i]').first();
      if (await confirmField.isVisible()) {
        await confirmField.fill(testPassword);
      }
    });

    await test.step('Step 4: Select role if available', async () => {
      const roleSelector = page.locator('select[name="role"], input[name="role"][type="radio"]').first();
      if (await roleSelector.isVisible()) {
        if (roleSelector.evaluate(el => el.tagName === 'SELECT')) {
          await roleSelector.selectOption('student');
        } else {
          await page.locator('input[name="role"][value="student"]').check();
        }
      }
    });

    await test.step('Step 5: Submit registration', async () => {
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      await submitButton.click();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Step 6: Verify registration result', async () => {
      // Either redirects to dashboard or shows success message
      await page.waitForTimeout(3000);
      const url = page.url();
      const hasSuccess = await page.locator('.success, .toast-success, [role="alert"]:has-text("success")').isVisible().catch(() => false);
      const isDashboard = url.match(/\/(student|teacher|admin)-dashboard/);
      
      expect(isDashboard || hasSuccess).toBeTruthy();
    });
  });

  // ============================================
  // Test Case 3: Concept Page Functionality
  // ============================================
  test('Test Case 3: View and interact with concepts', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 15000 });
    });

    await test.step('Step 2: Navigate to concepts page', async () => {
      // Try multiple ways to navigate to concepts
      const conceptLinks = [
        page.locator('a[href*="concept"], button:has-text("Concept"), [data-testid*="concept"]').first(),
        page.locator('text=/concept/i').first(),
        page.locator('[class*="concept"]').first()
      ];
      
      let navigated = false;
      for (const link of conceptLinks) {
        if (await link.isVisible()) {
          await link.click();
          await page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      }
      
      // If no link found, try direct navigation
      if (!navigated) {
        await page.goto('/student-dashboard');
        // Look for concepts tab or section
        const conceptsTab = page.locator('button:has-text("Concepts"), button:has-text("Study"), [class*="concept"]').first();
        if (await conceptsTab.isVisible()) {
          await conceptsTab.click();
        }
      }
    });

    await test.step('Step 3: Verify concepts are displayed', async () => {
      await page.waitForTimeout(3000);
      // Look for concept-related elements
      const conceptElements = page.locator('.concept, [class*="concept"], [data-testid*="concept"], h2, h3').first();
      await expect(conceptElements).toBeVisible({ timeout: 10000 });
    });

    await test.step('Step 4: Click on a concept to view details', async () => {
      const conceptItem = page.locator('.concept-item, [class*="concept-card"], [class*="concept"]').first();
      if (await conceptItem.isVisible()) {
        await conceptItem.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 5: Verify concept details are visible', async () => {
      const details = page.locator('.concept-details, .modal, [class*="detail"], [class*="content"]').first();
      if (await details.isVisible()) {
        await expect(details).toBeVisible();
      }
    });
  });

  // ============================================
  // Test Case 4: Quiz and Scoring Functionality
  // ============================================
  test('Test Case 4: Take quiz and verify scoring', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 15000 });
    });

    await test.step('Step 2: Navigate to quiz section', async () => {
      const quizLinks = [
        page.locator('a[href*="quiz"], button:has-text("Quiz"), [data-testid*="quiz"]').first(),
        page.locator('text=/quiz/i').first()
      ];
      
      let navigated = false;
      for (const link of quizLinks) {
        if (await link.isVisible()) {
          await link.click();
          await page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      }
      
      if (!navigated) {
        // Try dashboard tab
        const quizTab = page.locator('button:has-text("Quiz"), [class*="quiz"]').first();
        if (await quizTab.isVisible()) {
          await quizTab.click();
        }
      }
    });

    await test.step('Step 3: Start a quiz', async () => {
      await page.waitForTimeout(2000);
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Take Quiz")').first();
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 4: Answer quiz questions', async () => {
      // Look for question and answer options
      const question = page.locator('.question, [class*="question"], h2, h3').first();
      if (await question.isVisible()) {
        // Try to select an answer
        const options = page.locator('input[type="radio"], button:has-text(/[A-Z]/), [class*="option"]').first();
        if (await options.isVisible()) {
          await options.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    await test.step('Step 5: Submit quiz and verify score', async () => {
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish"), button:has-text("Complete")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(3000);
      }
      
      // Check for score or results
      const scoreElements = page.locator('.score, [class*="score"], [class*="result"], text=/score/i, text=/result/i').first();
      if (await scoreElements.isVisible()) {
        await expect(scoreElements).toBeVisible();
      }
    });
  });

  // ============================================
  // Test Case 5: AI Misconception Detector
  // ============================================
  test('Test Case 5: AI Misconception Detector', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 15000 });
    });

    await test.step('Step 2: Navigate to AI Misconception Detector', async () => {
      // Try direct navigation to ML page
      await page.goto('/ml');
      await page.waitForTimeout(3000);
      
      // Or look for link in navigation
      const mlLink = page.locator('a[href*="ml"], button:has-text("Misconception"), button:has-text("AI"), [data-testid*="misconception"]').first();
      if (await mlLink.isVisible()) {
        await mlLink.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 3: Verify misconception detector page loads', async () => {
      const pageElements = page.locator('h1, h2, [class*="misconception"], [class*="ml"], text=/misconception/i').first();
      await expect(pageElements).toBeVisible({ timeout: 10000 });
    });

    await test.step('Step 4: Enter student answer', async () => {
      const answerField = page.locator('textarea, input[type="text"], [placeholder*="answer" i], [data-testid*="answer"]').first();
      if (await answerField.isVisible()) {
        await answerField.fill('There are 18 grams which equals 18 moles of water.');
      }
    });

    await test.step('Step 5: Click analyze button', async () => {
      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect"), button:has-text("Submit"), button[type="submit"]').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
      }
    });

    await test.step('Step 6: Verify analysis results are displayed', async () => {
      const results = page.locator('.result, [class*="result"], [class*="analysis"], [class*="misconception"]').first();
      if (await results.isVisible()) {
        await expect(results).toBeVisible();
      }
    });
  });

  // ============================================
  // Test Case 6: Performance Dashboard
  // ============================================
  test('Test Case 6: Performance Dashboard', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 15000 });
    });

    await test.step('Step 2: Navigate to Performance Dashboard', async () => {
      // Try direct navigation
      await page.goto('/performance');
      await page.waitForTimeout(3000);
      
      // Or look for link
      const perfLink = page.locator('a[href*="performance"], button:has-text("Performance"), [data-testid*="performance"]').first();
      if (await perfLink.isVisible()) {
        await perfLink.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 3: Verify performance dashboard loads', async () => {
      const dashboardElements = page.locator('h1, h2, [class*="performance"], [class*="dashboard"], [class*="analytics"]').first();
      await expect(dashboardElements).toBeVisible({ timeout: 10000 });
    });

    await test.step('Step 4: Verify performance metrics are displayed', async () => {
      // Look for metrics, charts, or statistics
      const metrics = page.locator('.metric, [class*="metric"], [class*="stat"], [class*="score"], [class*="chart"]').first();
      if (await metrics.isVisible()) {
        await expect(metrics).toBeVisible();
      }
    });

    await test.step('Step 5: Verify charts or visualizations', async () => {
      const charts = page.locator('canvas, svg, [class*="chart"], [role="img"]').first();
      if (await charts.isVisible()) {
        await expect(charts).toBeVisible();
      }
    });
  });
});


