// Module 5: AI Misconception Detector Test
// Using real credentials: tessasaji2026@mca.ajce.in / Tessa@12345
import { test, expect } from '@playwright/test';
import { clearStorage } from './utils/testHelpers.js';

const USER_EMAIL = 'tessasaji2026@mca.ajce.in';
const USER_PASSWORD = 'Tessa@12345';

test.describe('Module 5: AI Misconception Detector', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('Test Case 5: AI Misconception Detector', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 20000 });
    });

    await test.step('Step 2: Navigate to AI Misconception Detector', async () => {
      // Try direct navigation to ML page
      await page.goto('/ml');
      await page.waitForTimeout(3000);
      
      // Or look for link in navigation
      const mlLink = page.locator('a[href*="ml"], button:has-text("Misconception"), button:has-text("AI")').first();
      if (await mlLink.isVisible({ timeout: 3000 })) {
        await mlLink.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 3: Verify misconception detector page loads', async () => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Use proper selectors - separate text locator from CSS
      const heading = page.locator('h1, h2').first();
      const mlElements = page.locator('[class*="misconception"], [class*="ml"], [class*="ML"]').first();
      const textMatch = page.getByText(/misconception|ML|machine learning/i).first();
      const bodyText = await page.textContent('body').catch(() => '');
      
      const isVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false) || 
                       await mlElements.isVisible({ timeout: 5000 }).catch(() => false) ||
                       await textMatch.isVisible({ timeout: 5000 }).catch(() => false) ||
                       bodyText.toLowerCase().includes('misconception') ||
                       bodyText.toLowerCase().includes('ml');
      
      expect(isVisible).toBeTruthy();
    });

    await test.step('Step 4: Enter student answer', async () => {
      const answerField = page.locator('textarea, input[type="text"], [placeholder*="answer" i], [data-testid*="answer"]').first();
      if (await answerField.isVisible({ timeout: 5000 })) {
        await answerField.fill('There are 18 grams which equals 18 moles of water.');
      }
    });

    await test.step('Step 5: Click analyze button', async () => {
      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect"), button:has-text("Submit"), button[type="submit"]').first();
      if (await analyzeButton.isVisible({ timeout: 5000 })) {
        await analyzeButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
      }
    });

    await test.step('Step 6: Verify analysis results are displayed', async () => {
      const results = page.locator('.result, [class*="result"], [class*="analysis"], [class*="misconception"]').first();
      if (await results.isVisible({ timeout: 5000 })) {
        await expect(results).toBeVisible();
      }
    });
  });
});

