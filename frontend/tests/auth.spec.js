// Authentication flow tests
import { test, expect } from '@playwright/test';
import { loginUser, logoutUser, clearStorage, mockApiResponse } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('Authentication Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test.describe('Login Flow', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      // Mock successful login response
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.student
      });

      await page.goto('/login');
      
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      // Should redirect to appropriate dashboard
      await expect(page).toHaveURL('/student-dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Mock failed login response
      await mockApiResponse(page, '/api/auth/login', {
        error: 'Invalid credentials'
      }, 401);

      await page.goto('/login');
      
      await page.fill('input[name="email"]', 'invalid@email.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      // Should show error message
      await expect(page.locator('.error, .alert, [role="alert"]')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'password123');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      // Should show validation error
      await expect(page.locator('.error, .invalid-feedback, [role="alert"]')).toBeVisible();
    });
  });

  test.describe('Registration Flow', () => {
    test('should register new student successfully', async ({ page }) => {
      // Mock successful registration response
      await mockApiResponse(page, '/api/auth/register', {
        token: 'mock-jwt-token',
        user: { ...testUsers.student, id: 'new-user-id' }
      });

      await page.goto('/register');
      
      await page.fill('input[name="email"]', 'newstudent@test.com');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');
      
      // Select student role if role selector exists
      const roleSelector = page.locator('select[name="role"], input[name="role"]').first();
      if (await roleSelector.isVisible()) {
        await roleSelector.selectOption('student');
      }
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      await submitButton.click();
      
      // Should redirect to student dashboard
      await expect(page).toHaveURL('/student-dashboard');
    });

    test('should show error for existing email', async ({ page }) => {
      // Mock registration error response
      await mockApiResponse(page, '/api/auth/register', {
        error: 'Email already exists'
      }, 409);

      await page.goto('/register');
      
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      await submitButton.click();
      
      // Should show error message
      await expect(page.locator('.error, .alert, [role="alert"]')).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'differentpassword');
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      await submitButton.click();
      
      // Should show validation error
      await expect(page.locator('.error, .invalid-feedback, [role="alert"]')).toBeVisible();
    });
  });

  test.describe('Role-based Access', () => {
    test('should redirect admin to admin dashboard', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.admin
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.admin.email);
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      await expect(page).toHaveURL('/admin-dashboard');
    });

    test('should redirect teacher to teacher dashboard', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.teacher
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.teacher.email);
      await page.fill('input[name="password"]', testUsers.teacher.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      await expect(page).toHaveURL('/teacher-dashboard');
    });

    test('should prevent unauthorized access to admin routes', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.student
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      // Try to access admin route
      await page.goto('/admin-dashboard');
      
      // Should redirect to student dashboard
      await expect(page).toHaveURL('/student-dashboard');
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.student
      });

      // Login first
      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      await expect(page).toHaveURL('/student-dashboard');
      
      // Mock logout response
      await mockApiResponse(page, '/api/auth/logout', { success: true });
      
      // Logout
      await logoutUser(page);
      
      // Should redirect to login page
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Token Persistence', () => {
    test('should maintain login state on page refresh', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.student
      });

      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await submitButton.click();
      
      await expect(page).toHaveURL('/student-dashboard');
      
      // Refresh page
      await page.reload();
      
      // Should still be on dashboard
      await expect(page).toHaveURL('/student-dashboard');
    });
  });
});
