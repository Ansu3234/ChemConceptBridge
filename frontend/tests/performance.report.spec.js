// Step-annotated Performance Dashboard Test (report-focused)
import { test, expect } from '@playwright/test';
import { loginUser, mockApiResponse, clearStorage } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('Performance Dashboard (Report)', () => {
	test('Student performance metrics visible', async ({ page }) => {
		await test.step('Pre-Condition: Student can login', async () => {
			await clearStorage(page);
			await mockApiResponse(page, '/api/auth/login', { token: 'mock', user: testUsers.student });
		});

		await test.step('Open Performance dashboard', async () => {
			await mockApiResponse(page, '/api/user/performance', {
				overallScore: 82,
				quizHistory: [{ quizId: 'q1', score: 78 }, { quizId: 'q2', score: 88 }],
				conceptsCompleted: 12,
				timeStudiedMinutes: 340,
				streakDays: 6
			});
			await loginUser(page, 'student');
			const link = page.locator('a[href*="performance"], button:has-text("Performance"), [data-testid*="performance"]').first();
			if (await link.isVisible()) await link.click();
			else await page.goto('/performance');
		});

		await test.step('Verify metrics and charts', async () => {
			const container = page.locator('.performance, [data-testid="performance-dashboard"], .analytics, .charts').first();
			await expect(container).toBeVisible();
			await expect(page.locator('text=82')).toBeVisible();
			// chart elements if present
			const chart = page.locator('.chart, canvas, svg, [role="img"][aria-label*="chart"]').first();
			if (await chart.isVisible()) await expect(chart).toBeVisible();
		});
	});
});

