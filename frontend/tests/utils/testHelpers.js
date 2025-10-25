// Utility functions for Playwright tests
import { testUsers } from '../fixtures/testData.js';

/**
 * Login helper function
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} userType - Type of user ('admin', 'teacher', 'student')
 */
export async function loginUser(page, userType) {
  const user = testUsers[userType];
  if (!user) {
    throw new Error(`Invalid user type: ${userType}`);
  }

  await page.goto('/login');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect after successful login
  await page.waitForURL(`/${userType}-dashboard`);
}

/**
 * Logout helper function
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function logoutUser(page) {
  // Look for logout button/link - adjust selector based on your UI
  const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), a:has-text("Logout")').first();
  await logoutButton.click();
  await page.waitForURL('/login');
}

/**
 * Wait for API response helper
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} url - API endpoint URL
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForApiResponse(page, url, timeout = 5000) {
  return page.waitForResponse(response => response.url().includes(url), { timeout });
}

/**
 * Clear localStorage helper
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock API response helper
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} url - API endpoint URL pattern
 * @param {any} responseData - Mock response data
 * @param {number} status - HTTP status code
 */
export async function mockApiResponse(page, url, responseData, status = 200) {
  await page.route(`**${url}`, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });
}

/**
 * Take screenshot helper
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Screenshot name
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
}

/**
 * Wait for element to be visible
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForElement(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * Fill form helper
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} formData - Object with field names as keys and values as values
 */
export async function fillForm(page, formData) {
  for (const [fieldName, value] of Object.entries(formData)) {
    await page.fill(`[name="${fieldName}"]`, value);
  }
}
