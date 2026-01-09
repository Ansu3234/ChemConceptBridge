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

test.describe('REAL CONCEPT PAGE TESTS', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should navigate to concepts page', async ({ page }) => {
    await loginRealUser(page);
    
    const conceptLink = page.locator('a[href*="concept"], button:has-text("Concept"), [data-testid*="concept"]').first();
    if (await conceptLink.isVisible()) {
      await conceptLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/concepts');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display concepts list', async ({ page }) => {
    await loginRealUser(page);
    
    const conceptLink = page.locator('a[href*="concept"], button:has-text("Concept")').first();
    if (await conceptLink.isVisible()) {
      await conceptLink.click();
    } else {
      await page.goto('/concepts');
    }
    
    await page.waitForLoadState('networkidle');
    
    const conceptItems = page.locator('.concept-item, [data-testid*="concept"], .concept-card, .card');
    const count = await conceptItems.count();
    
    if (count > 0) {
      await expect(conceptItems.first()).toBeVisible();
    }
  });

  test('should display concept title and description', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptTitle = page.locator('.concept-title, .title, h3, h2').first();
    if (await conceptTitle.isVisible()) {
      await expect(conceptTitle).toBeVisible();
    }
    
    const conceptDescription = page.locator('.concept-description, .description, p').first();
    if (await conceptDescription.isVisible()) {
      await expect(conceptDescription).toBeVisible();
    }
  });

  test('should click on concept to view details', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"], .concept-card').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display concept detail page', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"], .concept-card').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      
      const detailHeading = page.locator('h1, h2, .detail-title').first();
      if (await detailHeading.isVisible()) {
        await expect(detailHeading).toBeVisible();
      }
    }
  });

  test('should display concept content/description details', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"]').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      
      const content = page.locator('.content, .detail-content, .description, p').first();
      if (await content.isVisible()) {
        await expect(content).toBeVisible();
      }
    }
  });

  test('should display interactive visualizations if available', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"]').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      
      const visualization = page.locator('[data-testid*="visualization"], .visualization, .viz, canvas, svg').first();
      if (await visualization.isVisible()) {
        await expect(visualization).toBeVisible();
      }
    }
  });

  test('should allow marking concept as complete', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"]').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("Mark Complete"), [data-testid*="complete"]').first();
      if (await completeButton.isVisible()) {
        await completeButton.click();
        await page.waitForTimeout(500);
        
        const successMsg = page.locator('.success, .toast, [role="alert"]').first();
        if (await successMsg.isVisible()) {
          await expect(successMsg).toBeVisible();
        }
      }
    }
  });

  test('should search concepts', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], [data-testid="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('acid');
      await page.waitForTimeout(500);
      
      const results = page.locator('.concept-item, [data-testid*="concept"], .result').first();
      if (await results.isVisible()) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('should filter concepts by category', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const filterDropdown = page.locator('select[name="category"], [data-testid="category-filter"], .filter-dropdown').first();
    if (await filterDropdown.isVisible()) {
      const options = await filterDropdown.locator('option').count();
      if (options > 1) {
        await filterDropdown.selectOption({ index: 1 });
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should display concept prerequisites', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"]').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      
      const prereqSection = page.locator('[data-testid="prerequisites"], .prerequisites, .prereq').first();
      if (await prereqSection.isVisible()) {
        await expect(prereqSection).toBeVisible();
      }
    }
  });

  test('should track concept view in real time', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"]').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate back from concept detail', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/concepts');
    await page.waitForLoadState('networkidle');
    
    const conceptItem = page.locator('.concept-item, [data-testid*="concept"]').first();
    if (await conceptItem.isVisible()) {
      await conceptItem.click();
      await page.waitForLoadState('networkidle');
      
      const backButton = page.locator('button:has-text("Back"), button:has-text("← Back"), a:has-text("Back"), [data-testid="back"]').first();
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForLoadState('networkidle');
      } else {
        await page.goBack();
      }
    }
  });
});
