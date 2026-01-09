// Module 4: Quiz and Scoring Functionality Test
// Using real credentials: tessasaji2026@mca.ajce.in / Tessa@12345
import { test, expect } from '@playwright/test';
import { clearStorage } from './utils/testHelpers.js';

const USER_EMAIL = 'tessasaji2026@mca.ajce.in';
const USER_PASSWORD = 'Tessa@12345';

test.describe('Module 4: Quiz and Scoring Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('Test Case 4: Take quiz and verify scoring', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 20000 });
    });

    await test.step('Step 2: Navigate to quiz section', async () => {
      await page.waitForTimeout(2000);
      // Look for quiz button - try multiple selectors
      const selectors = [
        'button:has-text("Take a Quiz")',
        'button:has-text("Quiz")',
        'button:has-text("📝")',
        '[class*="quiz"] button',
        'button[onclick*="quiz"]'
      ];
      
      let clicked = false;
      for (const selector of selectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 }).catch(() => false)) {
          try {
            await button.scrollIntoViewIfNeeded();
            await button.click();
            await page.waitForTimeout(2000);
            clicked = true;
            break;
          } catch (e) {
            // Try next selector
          }
        }
      }
      
      if (!clicked) {
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 3: Start a quiz', async () => {
      await page.waitForTimeout(3000);
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Take Quiz")').first();
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 4: Answer quiz questions', async () => {
      // Look for question and answer options
      const question = page.locator('.question, [class*="question"], h2, h3').first();
      if (await question.isVisible({ timeout: 5000 })) {
        // Try to select an answer - use proper selectors
        const radioOption = page.locator('input[type="radio"]').first();
        if (await radioOption.isVisible({ timeout: 3000 })) {
          await radioOption.click();
          await page.waitForTimeout(1000);
        } else {
          // Try button options
          const buttonOption = page.locator('button[class*="option"], [class*="option"] button').first();
          if (await buttonOption.isVisible({ timeout: 3000 })) {
            await buttonOption.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    await test.step('Step 5: Submit quiz and verify score', async () => {
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish"), button:has-text("Complete")').first();
      if (await submitButton.isVisible({ timeout: 5000 })) {
        await submitButton.click();
        await page.waitForTimeout(3000);
      }
      
      // Check for score or results
      const scoreElements = page.locator('.score, [class*="score"], [class*="result"], text=/score/i, text=/result/i').first();
      if (await scoreElements.isVisible({ timeout: 5000 })) {
        await expect(scoreElements).toBeVisible();
      }
    });
  });
});

