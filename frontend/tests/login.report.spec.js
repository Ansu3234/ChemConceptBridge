// Step-annotated Login Test (report-focused)
import { test, expect } from './fixtures/authFixture.js';
import { mockApiResponse, clearStorage } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('Authentication - Login (Report)', () => {
	test('Verify Login with valid username and password', async ({ page }) => {
		await test.step('Pre-Condition: App server is running; user has valid credentials', async () => {
			// No-op step for documentation. CI/dev server managed by Playwright webServer.
		});

		await test.step('Open browser', async () => {
			// Implicit with Playwright runner; ensure page is usable
			await expect(page).toBeDefined();
		});

		await test.step('Navigate to login page', async () => {
			await clearStorage(page);
			await mockApiResponse(page, '/api/auth/login', {
				token: 'mock-jwt-token',
				user: testUsers.student
			});
			await page.goto('/login');
			await expect(page.locator('input[name="email"]')).toBeVisible();
		});

		await test.step('Enter valid username', async () => {
			await page.fill('input[name="email"]', testUsers.student.email);
		});

		await test.step('Enter valid password', async () => {
			await page.fill('input[name="password"]', testUsers.student.password);
		});

		await test.step('Click Login button', async () => {
			await page.click('button[type="submit"]');
		});

		await test.step('Verify redirect to dashboard', async () => {
			await expect(page).toHaveURL(/student-dashboard/i);
			const heading = page.getByRole('heading', { name: /dashboard|welcome|student/i });
			if (await heading.count()) {
				await expect(heading.first()).toBeVisible();
			}
		});

		await test.step('Post-Condition: User can access dashboard features', async () => {
			await expect(page.locator('nav, .sidebar, .navigation')).toBeVisible();
		});
	});
});

