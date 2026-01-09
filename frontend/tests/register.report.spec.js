// Step-annotated Registration Test (report-focused)
import { test, expect } from '@playwright/test';
import { mockApiResponse, clearStorage } from './utils/testHelpers.js';

test.describe('Authentication - Registration (Report)', () => {
	test('Verify Registration with valid details', async ({ page }) => {
		await test.step('Pre-Condition: App server is running', async () => {});

		await test.step('Navigate to register page', async () => {
			await clearStorage(page);
			await mockApiResponse(page, '/api/auth/register', {
				token: 'mock-jwt-token',
				user: { id: 'u1', email: 'newuser@test.com', role: 'student' }
			});
			await page.goto('/register');
			await expect(page.locator('input[name="email"]')).toBeVisible();
		});

		await test.step('Enter email', async () => {
			await page.fill('input[name="email"]', 'newuser@test.com');
		});

		await test.step('Enter password', async () => {
			await page.fill('input[name="password"]', 'password123');
			await page.fill('input[name="confirmPassword"]', 'password123');
		});

		await test.step('Submit registration', async () => {
			await page.click('button[type="submit"]');
		});

		await test.step('Verify redirect to dashboard', async () => {
			await expect(page).toHaveURL(/student-dashboard/i);
		});
	});
});

