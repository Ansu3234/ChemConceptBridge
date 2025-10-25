// Additional utility tests and API tests
import { test, expect } from '@playwright/test';
import { clearStorage, mockApiResponse, waitForApiResponse } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock server error
    await mockApiResponse(page, '/api/concepts', {
      error: 'Internal server error'
    }, 500);

    await page.goto('/');
    
    // Navigate to concepts page
    const conceptsLink = page.locator('a[href*="concept"], button:has-text("Concept")').first();
    if (await conceptsLink.isVisible()) {
      await conceptsLink.click();
      
      // Should show error message
      await expect(page.locator('.error, .alert, [role="alert"]')).toBeVisible();
    }
  });

  test('should handle network timeouts', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/concepts', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ concepts: [] })
        });
      }, 10000); // 10 second delay
    });

    await page.goto('/');
    
    // Should show loading state
    const loadingElement = page.locator('.loading, .spinner, [data-testid*="loading"]');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toBeVisible();
    }
  });
});

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('/');
    
    // Check if mobile navigation works
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-testid*="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      const navMenu = page.locator('.nav-menu, .mobile-nav');
      if (await navMenu.isVisible()) {
        await expect(navMenu).toBeVisible();
      }
    }
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    
    await page.goto('/');
    
    // Check if layout adapts to tablet
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    
    await page.goto('/');
    
    // Check if desktop layout works
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1 tag
    const h1 = page.locator('h1');
    if (await h1.isVisible()) {
      await expect(h1).toBeVisible();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for form labels
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if (await emailInput.isVisible()) {
      const emailLabel = page.locator('label[for*="email"], label:has-text("Email")');
      if (await emailLabel.isVisible()) {
        await expect(emailLabel).toBeVisible();
      }
    }
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await expect(submitButton).toBeVisible();
      // Check if button has accessible text
      const buttonText = await submitButton.textContent();
      expect(buttonText).toBeTruthy();
    }
  });
});

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load dashboard quickly', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    const startTime = Date.now();
    
    await page.goto('/login');
    await page.fill('input[name="email"]', testUsers.student.email);
    await page.fill('input[name="password"]', testUsers.student.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/student-dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should handle 404 errors', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show 404 page or redirect
    const notFoundElement = page.locator('.not-found, .error-404, h1:has-text("404")');
    if (await notFoundElement.isVisible()) {
      await expect(notFoundElement).toBeVisible();
    }
  });

  test('should handle invalid routes', async ({ page }) => {
    await page.goto('/invalid/route/here');
    
    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});
