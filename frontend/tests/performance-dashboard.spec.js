// Performance dashboard analytics tests
import { test, expect } from '@playwright/test';
import { loginUser, clearStorage, mockApiResponse } from './utils/testHelpers.js';
import { testUsers } from './fixtures/testData.js';

test.describe('Performance Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await clearStorage(page);
	});

	test('should display performance analytics for student', async ({ page }) => {
		// Mock auth
		await mockApiResponse(page, '/api/auth/login', {
			token: 'mock-jwt-token',
			user: testUsers.student
		});

		// Mock performance data (adjust to real endpoint if different)
		await mockApiResponse(page, '/api/user/performance', {
			overallScore: 82,
			quizHistory: [
				{ quizId: 'q1', score: 78 },
				{ quizId: 'q2', score: 88 }
			],
			conceptsCompleted: 12,
			timeStudiedMinutes: 340,
			streakDays: 6
		});

		await loginUser(page, 'student');

		// Navigate to performance dashboard
		const perfLink = page.locator('a[href*="performance"], button:has-text("Performance"), [data-testid*="performance"]').first();
		if (await perfLink.isVisible()) {
			await perfLink.click();
		} else {
			await page.goto('/performance');
		}

		// Core elements visible
		const container = page.locator('.performance, [data-testid="performance-dashboard"], .analytics, .charts').first();
		await expect(container).toBeVisible();

		// Check metrics presence
		await expect(page.locator('text=Overall', { hasText: undefined })).toBeVisible();
		await expect(page.locator('text=82')).toBeVisible();
		await expect(page.locator('text=streak', { hasText: undefined })).toBeVisible();
	});

	test('should display class analytics for teacher', async ({ page }) => {
		// Mock auth
		await mockApiResponse(page, '/api/auth/login', {
			token: 'mock-jwt-token',
			user: testUsers.teacher
		});

		// Mock teacher analytics
		await mockApiResponse(page, '/api/admin/analytics', {
			totalStudents: 25,
			averageScore: 78.5,
			topPerformers: ['Student A', 'Student B'],
			strugglingStudents: ['Student C'],
			distribution: [10, 7, 8]
		});

		await loginUser(page, 'teacher');

		// Navigate to analytics
		const analyticsLink = page.locator('a[href*="analytics"], button:has-text("Analytics"), [data-testid*="analytics"]').first();
		if (await analyticsLink.isVisible()) {
			await analyticsLink.click();
		} else {
			await page.goto('/teacher-dashboard/analytics');
		}

		// Charts/tables presence
		const chart = page.locator('.chart, canvas, svg, [role="img"][aria-label*="chart"]').first();
		await expect(chart).toBeVisible();
		await expect(page.locator('text=Average')).toBeVisible();
	});
});

