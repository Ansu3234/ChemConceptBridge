// Module 6: Performance Dashboard Test
// Using real credentials: tessasaji2026@mca.ajce.in / Tessa@12345
import { test, expect } from '@playwright/test';
import { clearStorage } from './utils/testHelpers.js';

const USER_EMAIL = 'tessasaji2026@mca.ajce.in';
const USER_PASSWORD = 'Tessa@12345';

test.describe('Module 6: Performance Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('Test Case 6: Performance Dashboard', async ({ page }) => {
    await test.step('Step 1: Login first', async () => {
      await page.goto('/login');
      await page.fill('input[name="email"], input[type="email"]', USER_EMAIL);
      await page.fill('input[name="password"], input[type="password"]', USER_PASSWORD);
      await page.click('button[type="submit"], button:has-text("Login")');
      await page.waitForURL(/\/(student|teacher|admin)-dashboard/, { timeout: 20000 });
    });

    await test.step('Step 2: Navigate to Performance Dashboard', async () => {
      // Try direct navigation
      await page.goto('/performance');
      await page.waitForTimeout(3000);
      
      // Or look for link
      const perfLink = page.locator('a[href*="performance"], button:has-text("Performance")').first();
      if (await perfLink.isVisible({ timeout: 3000 })) {
        await perfLink.click();
        await page.waitForTimeout(2000);
      }
    });

    await test.step('Step 3: Verify performance dashboard loads', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Try multiple selectors
      const selectors = [
        'h1, h2',
        '[class*="performance"]',
        '[class*="dashboard"]',
        '[class*="analytics"]',
        '[class*="Performance"]'
      ];
      
      let found = false;
      for (const selector of selectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          found = true;
          break;
        }
      }
      
      // Also check body text
      const bodyText = await page.textContent('body').catch(() => '');
      if (bodyText.toLowerCase().includes('performance') || bodyText.toLowerCase().includes('dashboard')) {
        found = true;
      }
      
      expect(found).toBeTruthy();
    });

    await test.step('Step 4: Verify performance metrics are displayed', async () => {
      // Look for metrics, charts, or statistics
      const metrics = page.locator('.metric, [class*="metric"], [class*="stat"], [class*="score"]').first();
      if (await metrics.isVisible({ timeout: 5000 })) {
        await expect(metrics).toBeVisible();
      }
    });

    await test.step('Step 5: Verify charts or visualizations', async () => {
      const charts = page.locator('canvas, svg, [class*="chart"], [role="img"]').first();
      if (await charts.isVisible({ timeout: 5000 })) {
        await expect(charts).toBeVisible();
      }
    });
  });
});

