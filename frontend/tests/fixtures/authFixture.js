// Auth fixture with step logging for Allure reports
import base, { expect } from '@playwright/test';
import { mockApiResponse, clearStorage, loginUser } from '../utils/testHelpers.js';
import { testUsers } from './testData.js';

export const test = base.extend({
	// 'login' fixture logs in with a specified role and returns the logged-in user
	login: async ({ page }, use) => {
		await clearStorage(page);
		await test.step('Mock auth API', async () => {
			await mockApiResponse(page, '/api/auth/login', {
				token: 'mock-jwt-token',
				user: testUsers.student
			});
		});
		await test.step('Navigate to login page', async () => {
			await page.goto('/login');
		});
		await test.step('Perform login', async () => {
			await loginUser(page, 'student');
		});
		await use({ role: 'student' });
	}
});

export { expect };

