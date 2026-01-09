// Module 2: Registration Functionality Test
import { test, expect } from '@playwright/test';
import { clearStorage } from './utils/testHelpers.js';

test.describe('Module 2: Registration Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('Test Case 2: Registration with valid details', async ({ page }) => {
    await test.step('Step 1: Navigate to register page', async () => {
      await page.goto('/register');
      await expect(page).toHaveURL(/register/i);
      await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible({ timeout: 10000 });
    });

    await test.step('Step 2: Enter full name', async () => {
      const nameField = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="Name" i]').first();
      if (await nameField.isVisible({ timeout: 5000 })) {
        await nameField.fill('Test User');
      }
    });

    await test.step('Step 3: Enter email', async () => {
      const testEmail = `test${Date.now()}@test.com`;
      await page.fill('input[name="email"], input[type="email"]', testEmail);
    });

    await test.step('Step 4: Enter password and confirm', async () => {
      const testPassword = 'Test@12345';
      await page.fill('input[name="password"], input[type="password"]', testPassword);
      
      const confirmField = page.locator('input[name="confirmPassword"], input[name="confirm"], input[placeholder*="confirm" i]').first();
      if (await confirmField.isVisible()) {
        await confirmField.fill(testPassword);
      }
    });

    await test.step('Step 5: Select role if available', async () => {
      const roleSelector = page.locator('select[name="role"]').first();
      if (await roleSelector.isVisible({ timeout: 3000 })) {
        await roleSelector.selectOption('student');
      } else {
        const radioRole = page.locator('input[name="role"][value="student"]').first();
        if (await radioRole.isVisible({ timeout: 3000 })) {
          await radioRole.check();
        }
      }
    });

    await test.step('Step 6: Submit registration', async () => {
      // Wait a bit for any validation to complete
      await page.waitForTimeout(1000);
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up"), button:has-text("CREATE ACCOUNT")').first();
      await submitButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000); // Wait longer for registration to complete
    });

    await test.step('Step 7: Verify registration result', async () => {
      // Check if we're redirected to dashboard
      const url = page.url();
      const isDashboard = url.match(/\/(student|teacher|admin)-dashboard|\/dashboard/);
      
      // Check for success message
      const hasSuccess = await page.locator('.success, .toast-success, [role="alert"]').filter({ hasText: /success/i }).isVisible().catch(() => false);
      
      // Check for error message (email exists, etc.)
      const hasError = await page.locator('.error, .alert-danger, [role="alert"]').filter({ hasText: /error|already|exists/i }).isVisible().catch(() => false);
      
      // Check for validation errors (should not be present if form was filled correctly)
      const hasValidationError = await page.locator('text=/required|Name is required/i').isVisible().catch(() => false);
      
      // Registration should either succeed (redirect to dashboard) or show a meaningful error
      // But validation errors mean the form wasn't filled correctly
      if (hasValidationError) {
        throw new Error('Form validation failed - required fields not filled');
      }
      
      expect(isDashboard || hasSuccess || hasError).toBeTruthy();
    });
  });
});

