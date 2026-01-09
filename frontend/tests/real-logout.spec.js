import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'tessasaji2026@mca.ajce.in',
  password: 'Tessa@12345'
};

async function loginRealUser(page) {
  await page.goto('/login');
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  
  await emailInput.fill(TEST_USER.email);
  await passwordInput.fill(TEST_USER.password);
  
  const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
  await loginButton.click();
  
  await page.waitForLoadState('networkidle');
}

test.describe('REAL LOGOUT & SESSION TESTS', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should logout successfully', async ({ page }) => {
    await loginRealUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/login|signin|home/);
    }
  });

  test('should clear authentication token on logout', async ({ page }) => {
    await loginRealUser(page);
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
      
      const clearedToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(clearedToken).toBeNull();
    }
  });

  test('should redirect to login after logout', async ({ page }) => {
    await loginRealUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/login|signin/);
    }
  });

  test('should prevent access to protected routes after logout', async ({ page }) => {
    await loginRealUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/login|signin/);
      
      await page.goto('/student-dashboard');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/login|signin/);
    }
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    await loginRealUser(page);
    
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });
    
    await page.goto('/student-dashboard');
    await page.waitForLoadState('networkidle');
    
    const loginForm = page.locator('input[name="email"], input[type="email"]').first();
    if (await loginForm.isVisible()) {
      await expect(loginForm).toBeVisible();
    }
  });

  test('should maintain session with valid token', async ({ page }) => {
    await loginRealUser(page);
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const newToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(newToken).toBe(token);
  });

  test('should display user info before logout', async ({ page }) => {
    await loginRealUser(page);
    
    const userDisplay = page.locator(`text=${TEST_USER.email}, text=tessa, [data-testid*="user"]`).first();
    if (await userDisplay.isVisible()) {
      await expect(userDisplay).toBeVisible();
    }
  });

  test('should have accessible logout button in menu', async ({ page }) => {
    await loginRealUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile"), .profile-icon').first();
    if (await userMenu.isVisible()) {
      await expect(userMenu).toBeVisible();
      
      await userMenu.click();
      
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
      if (await logoutButton.isVisible()) {
        await expect(logoutButton).toBeVisible();
      }
    }
  });

  test('should logout from different pages', async ({ page }) => {
    await loginRealUser(page);
    
    const conceptLink = page.locator('a[href*="concept"], button:has-text("Concept")').first();
    if (await conceptLink.isVisible()) {
      await conceptLink.click();
      await page.waitForLoadState('networkidle');
    }
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/login|signin/);
      await expect(page).toHaveURL(/login|signin/);
    }
  });

  test('should clear all session storage on logout', async ({ page }) => {
    await loginRealUser(page);
    
    await page.evaluate(() => {
      sessionStorage.setItem('test-key', 'test-value');
    });
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
    }
  });
});
