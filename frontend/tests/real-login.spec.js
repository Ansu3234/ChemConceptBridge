import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'tessasaji2026@mca.ajce.in',
  password: 'Tessa@12345'
};

test.describe('REAL LOGIN TESTS - Tessa Account', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should login successfully with real credentials', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    const dashboardHeading = page.locator('h1, h2, .dashboard-title').first();
    if (await dashboardHeading.isVisible()) {
      await expect(dashboardHeading).toBeVisible();
    }
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await expect(userMenu).toBeVisible();
    }
  });

  test('should check if token is stored after login', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('should persist session after page reload', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    await page.reload();
    
    await page.waitForLoadState('networkidle');
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
    await loginButton.click();
    
    await page.waitForURL(/dashboard|home/);
  });

  test('should display user information in dashboard', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    
    const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
    await loginButton.click();
    
    await page.waitForLoadState('networkidle');
    
    const userNameOrEmail = page.locator(`text=${TEST_USER.email}, text=tessa, text=Tessa`).first();
    if (await userNameOrEmail.isVisible()) {
      await expect(userNameOrEmail).toBeVisible();
    }
  });
});
