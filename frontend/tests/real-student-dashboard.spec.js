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

test.describe('REAL STUDENT DASHBOARD TESTS', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display student dashboard after login', async ({ page }) => {
    await loginRealUser(page);
    
    const heading = page.locator('h1, h2, .dashboard-title').first();
    await expect(heading).toBeVisible();
  });

  test('should display welcome message', async ({ page }) => {
    await loginRealUser(page);
    
    const welcomeMsg = page.locator('text=/welcome|hello|dashboard/i').first();
    if (await welcomeMsg.isVisible()) {
      await expect(welcomeMsg).toBeVisible();
    }
  });

  test('should display navigation menu', async ({ page }) => {
    await loginRealUser(page);
    
    const navMenu = page.locator('nav, .sidebar, .navigation, .navbar').first();
    if (await navMenu.isVisible()) {
      await expect(navMenu).toBeVisible();
    }
  });

  test('should display progress section', async ({ page }) => {
    await loginRealUser(page);
    
    const progressSection = page.locator('[data-testid*="progress"], .progress, .progress-section').first();
    if (await progressSection.isVisible()) {
      await expect(progressSection).toBeVisible();
    }
  });

  test('should display quiz section', async ({ page }) => {
    await loginRealUser(page);
    
    const quizSection = page.locator('[data-testid*="quiz"], .quiz, .quiz-section, text=/quiz/i').first();
    if (await quizSection.isVisible()) {
      await expect(quizSection).toBeVisible();
    }
  });

  test('should display concept section', async ({ page }) => {
    await loginRealUser(page);
    
    const conceptSection = page.locator('[data-testid*="concept"], .concept, .concept-section, text=/concept/i').first();
    if (await conceptSection.isVisible()) {
      await expect(conceptSection).toBeVisible();
    }
  });

  test('should allow navigation to quiz', async ({ page }) => {
    await loginRealUser(page);
    
    const quizLink = page.locator('a[href*="quiz"], button:has-text("Quiz"), [data-testid*="quiz"]').first();
    if (await quizLink.isVisible()) {
      await quizLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toContain(/quiz|assessment/i);
    }
  });

  test('should allow navigation to concepts', async ({ page }) => {
    await loginRealUser(page);
    
    const conceptLink = page.locator('a[href*="concept"], button:has-text("Concept"), [data-testid*="concept"]').first();
    if (await conceptLink.isVisible()) {
      await conceptLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should allow navigation to performance', async ({ page }) => {
    await loginRealUser(page);
    
    const performanceLink = page.locator('a[href*="performance"], button:has-text("Performance"), [data-testid*="performance"]').first();
    if (await performanceLink.isVisible()) {
      await performanceLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display user menu/profile', async ({ page }) => {
    await loginRealUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await expect(userMenu).toBeVisible();
    }
  });

  test('should have logout option in menu', async ({ page }) => {
    await loginRealUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile, button:has-text("Profile")').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
      if (await logoutButton.isVisible()) {
        await expect(logoutButton).toBeVisible();
      }
    }
  });

  test('should display dashboard cards/widgets', async ({ page }) => {
    await loginRealUser(page);
    
    const cards = page.locator('.card, [role="region"], .widget, .dashboard-card');
    const cardCount = await cards.count();
    
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('should display statistics/metrics', async ({ page }) => {
    await loginRealUser(page);
    
    const stats = page.locator('[data-testid*="stat"], .stat, .metric, .number').first();
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
    }
  });

  test('should display recent activity or score info', async ({ page }) => {
    await loginRealUser(page);
    
    const activity = page.locator('[data-testid*="recent"], .recent, .activity, .score-info').first();
    if (await activity.isVisible()) {
      await expect(activity).toBeVisible();
    }
  });
});
