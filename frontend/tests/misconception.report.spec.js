// Step-annotated AI Misconception Detector Test (report-focused)
import { test, expect } from '@playwright/test';
import { loginUser, mockApiResponse, clearStorage } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('AI Misconception Detector (Report)', () => {
	test('Analyze answer and show remediation', async ({ page }) => {
		await test.step('Pre-Condition: Student can login', async () => {
			await clearStorage(page);
			await mockApiResponse(page, '/api/auth/login', { token: 'mock', user: testUsers.student });
		});

		await test.step('Open Misconception tool', async () => {
			await loginUser(page, 'student');
			const link = page.locator('a[href*="misconception"], button:has-text("Misconception"), [data-testid*="misconception"]').first();
			if (await link.isVisible()) await link.click();
			else await page.goto('/ai-misconception');
		});

		await test.step('Enter answer and analyze', async () => {
			await mockApiResponse(page, '/api/ml/misconception', {
				isMisconceptionDetected: true,
				label: 'Conflating mass and moles',
				confidence: 0.92,
				explanation: 'The answer confuses grams with number of moles.',
				remediation: ['Review mass vs moles', 'Convert grams to moles practice']
			});
			await page.fill('textarea, [data-testid="student-answer"]', 'There are 18 grams which equals 18 moles of water.');
			const analyze = page.locator('button:has-text("Analyze"), button:has-text("Detect"), [data-testid="analyze-button"]').first();
			await analyze.click();
		});

		await test.step('Verify feedback and remediation', async () => {
			await expect(page.locator('[data-testid="misconception-result"], .misconception-result, .analysis-result').first()).toBeVisible();
			await expect(page.locator('text=Conflating mass and moles')).toBeVisible();
			await expect(page.locator('text=confuses grams with number of moles')).toBeVisible();
		});
	});
});

