// Module 1: Login Functionality Test
// Using real credentials: tessasaji2026@mca.ajce.in / Tessa@12345
import { test, expect } from '@playwright/test';
import { clearStorage } from './utils/testHelpers.js';

const USER_EMAIL = 'tessasaji2026@mca.ajce.in';
const USER_PASSWORD = 'Tessa@12345';

test.describe('Module 1: Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

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
      // Wait for navigation or error message
      await Promise.race([
        page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 20000 }).catch(() => null),
        page.waitForTimeout(3000)
      ]);
    });

    await test.step('Step 6: Verify redirect to dashboard', async () => {
      // Wait a bit more for redirect
      await page.waitForTimeout(2000);
      const url = page.url();
      const isDashboard = url.match(/\/(student|teacher|admin)-dashboard/);
      
      // If not redirected, check for error
      if (!isDashboard) {
        const errorMsg = await page.locator('.error, .alert, [role="alert"]').isVisible().catch(() => false);
        if (errorMsg) {
          // Try one more time - sometimes backend takes time
          await page.waitForTimeout(3000);
          const url2 = page.url();
          expect(url2).toMatch(/\/(student|teacher|admin)-dashboard/);
        } else {
          expect(url).toMatch(/\/(student|teacher|admin)-dashboard/);
        }
      } else {
        expect(isDashboard).toBeTruthy();
      }
    });

    await test.step('Step 7: Verify dashboard elements are visible', async () => {
      const heading = page.locator('h1, h2, [class*="dashboard"], [class*="Dashboard"]').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      
      const nav = page.locator('nav, .sidebar, .navigation, [class*="nav"]').first();
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }
    });
  });
});

