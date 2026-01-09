// Quiz scoring flow tests
import { test, expect } from '@playwright/test';
import { loginUser, clearStorage, mockApiResponse } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('Quiz Scoring', () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
	});

	test('should complete a quiz and display score', async ({ page }) => {
		// Mock auth
		await mockApiResponse(page, '/api/auth/login', {
			token: 'mock-jwt-token',
			user: testUsers.student
		});

		// Mock quiz load
		await mockApiResponse(page, '/api/quiz/quiz-1', {
			id: 'quiz-1',
			title: 'Basic Chemistry Quiz',
			questions: [
				{
					id: 'q1',
					question: 'What is the chemical symbol for water?',
					options: ['H2O', 'CO2', 'NaCl', 'O2'],
					correctAnswer: 0
				},
				{
					id: 'q2',
					question: 'What is the atomic number of Hydrogen?',
					options: ['1', '2', '8', '10'],
					correctAnswer: 0
				}
			]
		});

		// Mock submission and scoring
		await mockApiResponse(page, '/api/quiz/submit', {
			score: 90,
			totalQuestions: 2,
			correctAnswers: 2,
			feedback: 'Excellent work!'
		});

		// Login and start quiz
		await loginUser(page, 'student');
		await page.goto('/quiz/quiz-1');

		// Answer Q1
		const option1 = page.locator('input[value="H2O"], button:has-text("H2O"), [data-testid="option-q1-0"], [data-testid="option-0"]').first();
		if (await option1.isVisible()) {
			await option1.click();
		}
		const next1 = page.locator('button:has-text("Next"), button:has-text("Submit"), button[type="submit"]').first();
		if (await next1.isVisible()) {
			await next1.click();
		}

		// Answer Q2
		const option2 = page.locator('input[value="1"], button:has-text("1"), [data-testid="option-q2-0"], [data-testid="option-0"]').first();
		if (await option2.isVisible()) {
			await option2.click();
		}
		const submit = page.locator('button:has-text("Submit"), button:has-text("Finish"), button[type="submit"]').first();
		if (await submit.isVisible()) {
			await submit.click();
		}

		// Results visible with score
		const results = page.locator('.results, .score, [data-testid*="result"], [data-testid*="score"]');
		await expect(results.first()).toBeVisible();
		await expect(page.locator('text=90')).toBeVisible();
		await expect(page.locator('text=Excellent')).toBeVisible();
	});
});

