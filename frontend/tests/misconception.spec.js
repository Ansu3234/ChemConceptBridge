// AI Misconception Detector tests
import { test, expect } from '@playwright/test';
import { loginUser, clearStorage, mockApiResponse } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('AI Misconception Detector', () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
	});

	test('should analyze student answer and show misconception feedback', async ({ page }) => {
		// Mock auth
		await mockApiResponse(page, '/api/auth/login', {
			token: 'mock-jwt-token',
			user: testUsers.student
		});

		// Mock AI analysis endpoint (adjust to your actual route)
		await mockApiResponse(page, '/api/ml/misconception', {
			isMisconceptionDetected: true,
			label: 'Conflating mass and moles',
			confidence: 0.92,
			explanation: 'The answer confuses grams with number of moles.',
			remediation: [
				'Review the relationship between mass, molar mass, and moles',
				'Practice converting grams to moles using sample problems'
			]
		});

		await loginUser(page, 'student');

		// Navigate to misconception detector UI
		const nav = page.locator('a[href*="misconception"], button:has-text("Misconception"), [data-testid*="misconception"]').first();
		if (await nav.isVisible()) {
			await nav.click();
		} else {
			// Fallback to direct route if link isn't visible
			await page.goto('/ai-misconception');
		}

		// Provide an answer to analyze
		const input = page.locator('textarea[name="answer"], [data-testid="student-answer"], textarea').first();
		await input.fill('There are 18 grams which equals 18 moles of water.');

		// Trigger analysis
		const analyze = page.locator('button:has-text("Analyze"), button:has-text("Detect"), [data-testid="analyze-button"]').first();
		await analyze.click();

		// Expect result UI
		const result = page.locator('[data-testid="misconception-result"], .misconception-result, .analysis-result').first();
		await expect(result).toBeVisible();

		// Core fields
		await expect(page.locator('text=Conflating mass and moles')).toBeVisible();
		await expect(page.locator('text=confuses grams with number of moles')).toBeVisible();
		await expect(page.locator('text=Review the relationship between mass')).toBeVisible();
	});
});

