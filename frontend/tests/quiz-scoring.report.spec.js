// Step-annotated Quiz + Scoring Test (report-focused)
import { test, expect } from '@playwright/test';
import { loginUser, mockApiResponse, clearStorage } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('Quiz and Scoring (Report)', () => {
	test('Start quiz, answer, and verify score', async ({ page }) => {
		await test.step('Pre-Condition: Student can login', async () => {
			await clearStorage(page);
			await mockApiResponse(page, '/api/auth/login', { token: 'mock', user: testUsers.student });
		});

		await test.step('Login and open quiz', async () => {
			await loginUser(page, 'student');
			await mockApiResponse(page, '/api/quiz/quiz-1', {
				id: 'quiz-1',
				title: 'Basic Chemistry Quiz',
				questions: [
					{ id: 'q1', question: 'Water?', options: ['H2O', 'CO2'], correctAnswer: 0 },
					{ id: 'q2', question: 'Hydrogen?', options: ['1', '2'], correctAnswer: 0 }
				]
			});
			await page.goto('/quiz/quiz-1');
		});

		await test.step('Answer questions', async () => {
			const opt1 = page.locator('input[value="H2O"], button:has-text("H2O"), [data-testid="option-0"]').first();
			if (await opt1.isVisible()) await opt1.click();
			const next = page.locator('button:has-text("Next"), button:has-text("Submit")').first();
			if (await next.isVisible()) await next.click();

			const opt2 = page.locator('input[value="1"], button:has-text("1"), [data-testid="option-0"]').first();
			if (await opt2.isVisible()) await opt2.click();
		});

		await test.step('Submit and verify score', async () => {
			await mockApiResponse(page, '/api/quiz/submit', {
				score: 100,
				totalQuestions: 2,
				correctAnswers: 2,
				feedback: 'Perfect score!'
			});
			const submit = page.locator('button:has-text("Submit"), button:has-text("Finish")').first();
			if (await submit.isVisible()) await submit.click();
			await expect(page.locator('.results, .score, [data-testid*="score"]')).toBeVisible();
			await expect(page.locator('text=100')).toBeVisible();
		});
	});
});

