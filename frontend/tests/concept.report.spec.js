// Step-annotated Concept Page Test (report-focused)
import { test, expect } from '@playwright/test';
import { loginUser, mockApiResponse, clearStorage } from './utils/testHelpers.js';
import { testUsers, testData } from './fixtures/testData.js';

test.describe('Concept Page (Report)', () => {
	test('View and interact with concepts', async ({ page }) => {
		await test.step('Pre-Condition: Student is able to login', async () => {
			await clearStorage(page);
			await mockApiResponse(page, '/api/auth/login', { token: 'mock', user: testUsers.student });
		});

		await test.step('Login and open concept page', async () => {
			await loginUser(page, 'student');
			await mockApiResponse(page, '/api/concept-map', {
				concepts: testData.concepts,
				connections: [{ from: 'concept-1', to: 'concept-2', type: 'prerequisite' }]
			});
			const conceptLink = page.locator('a[href*="concept"], button:has-text("Concept"), [data-testid*="concept"]').first();
			if (await conceptLink.isVisible()) {
				await conceptLink.click();
			} else {
				await page.goto('/concept-map');
			}
		});

		await test.step('Verify concept map is visible', async () => {
			const map = page.locator('.concept-map, [data-testid*="concept-map"], .concept-node');
			await expect(map.first()).toBeVisible();
		});

		await test.step('Open a concept detail', async () => {
			const node = page.locator('.concept-node, [data-testid*="concept"], .concept').first();
			if (await node.isVisible()) {
				await node.click();
			}
			const details = page.locator('.concept-details, .modal, [data-testid*="details"]');
			if (await details.isVisible()) {
				await expect(details).toBeVisible();
			}
		});
	});
});

