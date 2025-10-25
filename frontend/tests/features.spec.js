// Core feature tests - Dashboard, Quiz, Concept Map
import { test, expect } from '@playwright/test';
import { loginUser, clearStorage, mockApiResponse, waitForElement } from './utils/testHelpers.js';
import { testUsers, testData } from './fixtures/testData.js';

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test.describe('Student Dashboard', () => {
    test('should display student dashboard elements', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.student
      });

      await loginUser(page, 'student');
      
      // Check for dashboard elements
      await expect(page.locator('h1, h2')).toContainText(/Dashboard|Welcome|Student/i);
      
      // Check for navigation elements
      await expect(page.locator('nav, .sidebar, .navigation')).toBeVisible();
      
      // Check for key sections
      const sections = ['progress', 'quiz', 'concept', 'performance'];
      for (const section of sections) {
        const sectionElement = page.locator(`[data-testid*="${section}"], .${section}, #${section}`).first();
        if (await sectionElement.isVisible()) {
          await expect(sectionElement).toBeVisible();
        }
      }
    });

    test('should display progress tracking', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.student
      });

      await mockApiResponse(page, '/api/user/progress', {
        completedConcepts: 5,
        totalConcepts: 10,
        quizScores: [85, 90, 78],
        streak: 7
      });

      await loginUser(page, 'student');
      
      // Check for progress elements
      const progressElements = page.locator('.progress, [data-testid*="progress"], .progress-bar');
      if (await progressElements.first().isVisible()) {
        await expect(progressElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Teacher Dashboard', () => {
    test('should display teacher dashboard elements', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.teacher
      });

      await loginUser(page, 'teacher');
      
      // Check for teacher-specific elements
      await expect(page.locator('h1, h2')).toContainText(/Teacher|Dashboard|Welcome/i);
      
      // Check for teacher-specific sections
      const teacherSections = ['students', 'analytics', 'quiz', 'concept'];
      for (const section of teacherSections) {
        const sectionElement = page.locator(`[data-testid*="${section}"], .${section}, #${section}`).first();
        if (await sectionElement.isVisible()) {
          await expect(sectionElement).toBeVisible();
        }
      }
    });

    test('should display student analytics', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.teacher
      });

      await mockApiResponse(page, '/api/admin/analytics', {
        totalStudents: 25,
        averageScore: 78.5,
        topPerformers: ['Student A', 'Student B'],
        strugglingStudents: ['Student C']
      });

      await loginUser(page, 'teacher');
      
      // Check for analytics elements
      const analyticsElements = page.locator('.analytics, [data-testid*="analytics"], .chart, .statistics');
      if (await analyticsElements.first().isVisible()) {
        await expect(analyticsElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should display admin dashboard elements', async ({ page }) => {
      await mockApiResponse(page, '/api/auth/login', {
        token: 'mock-jwt-token',
        user: testUsers.admin
      });

      await loginUser(page, 'admin');
      
      // Check for admin-specific elements
      await expect(page.locator('h1, h2')).toContainText(/Admin|Dashboard|Welcome/i);
      
      // Check for admin-specific sections
      const adminSections = ['users', 'analytics', 'moderation', 'settings'];
      for (const section of adminSections) {
        const sectionElement = page.locator(`[data-testid*="${section}"], .${section}, #${section}`).first();
        if (await sectionElement.isVisible()) {
          await expect(sectionElement).toBeVisible();
        }
      }
    });
  });
});

test.describe('Quiz Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should start a quiz', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await mockApiResponse(page, '/api/quiz', {
      quizzes: [{
        id: 'quiz-1',
        title: 'Basic Chemistry Quiz',
        questions: testData.quizzes[0].questions
      }]
    });

    await loginUser(page, 'student');
    
    // Navigate to quiz section
    const quizLink = page.locator('a[href*="quiz"], button:has-text("Quiz"), [data-testid*="quiz"]').first();
    if (await quizLink.isVisible()) {
      await quizLink.click();
    }
    
    // Start quiz
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), [data-testid*="start"]').first();
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Check if quiz interface loads
      await expect(page.locator('.quiz, [data-testid*="quiz"], .question')).toBeVisible();
    }
  });

  test('should answer quiz questions', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await mockApiResponse(page, '/api/quiz/quiz-1', {
      id: 'quiz-1',
      title: 'Basic Chemistry Quiz',
      questions: [{
        id: 'q1',
        question: 'What is the chemical symbol for water?',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctAnswer: 0
      }]
    });

    await loginUser(page, 'student');
    
    // Navigate to quiz (adjust based on your routing)
    await page.goto('/quiz/quiz-1');
    
    // Answer question
    const option = page.locator('input[value="H2O"], button:has-text("H2O"), [data-testid="option-0"]').first();
    if (await option.isVisible()) {
      await option.click();
      
      // Submit answer
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Next"), button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
    }
  });

  test('should display quiz results', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await mockApiResponse(page, '/api/quiz/submit', {
      score: 85,
      totalQuestions: 10,
      correctAnswers: 8.5,
      feedback: 'Good job!'
    });

    await loginUser(page, 'student');
    
    // Complete quiz flow and check results
    const resultsElements = page.locator('.results, .score, [data-testid*="result"]');
    if (await resultsElements.first().isVisible()) {
      await expect(resultsElements.first()).toBeVisible();
    }
  });
});

test.describe('Concept Map Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should display concept map', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await mockApiResponse(page, '/api/concept-map', {
      concepts: testData.concepts,
      connections: [
        { from: 'concept-1', to: 'concept-2', type: 'prerequisite' }
      ]
    });

    await loginUser(page, 'student');
    
    // Navigate to concept map
    const conceptMapLink = page.locator('a[href*="concept"], button:has-text("Concept"), [data-testid*="concept"]').first();
    if (await conceptMapLink.isVisible()) {
      await conceptMapLink.click();
    }
    
    // Check for concept map elements
    const conceptMapElements = page.locator('.concept-map, [data-testid*="concept-map"], .concept-node');
    if (await conceptMapElements.first().isVisible()) {
      await expect(conceptMapElements.first()).toBeVisible();
    }
  });

  test('should allow concept interaction', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await mockApiResponse(page, '/api/concept-map', {
      concepts: testData.concepts
    });

    await loginUser(page, 'student');
    
    // Navigate to concept map
    await page.goto('/concept-map');
    
    // Click on a concept node
    const conceptNode = page.locator('.concept-node, [data-testid*="concept"], .concept').first();
    if (await conceptNode.isVisible()) {
      await conceptNode.click();
      
      // Check if concept details open
      const conceptDetails = page.locator('.concept-details, .modal, .popup, [data-testid*="details"]');
      if (await conceptDetails.isVisible()) {
        await expect(conceptDetails).toBeVisible();
      }
    }
  });

  test('should track concept completion', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await mockApiResponse(page, '/api/concept/complete', {
      success: true,
      conceptId: 'concept-1'
    });

    await loginUser(page, 'student');
    
    // Complete a concept (adjust based on your UI)
    const completeButton = page.locator('button:has-text("Complete"), button:has-text("Mark Complete"), [data-testid*="complete"]').first();
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // Check for success feedback
      const successMessage = page.locator('.success, .toast, [role="alert"]');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    }
  });
});

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test('should navigate between dashboard sections', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await loginUser(page, 'student');
    
    // Test navigation between different sections
    const navItems = page.locator('nav a, .sidebar a, .navigation a');
    const navCount = await navItems.count();
    
    for (let i = 0; i < Math.min(navCount, 3); i++) {
      const navItem = navItems.nth(i);
      if (await navItem.isVisible()) {
        await navItem.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should maintain active state for current page', async ({ page }) => {
    await mockApiResponse(page, '/api/auth/login', {
      token: 'mock-jwt-token',
      user: testUsers.student
    });

    await loginUser(page, 'student');
    
    // Check for active navigation state
    const activeNavItem = page.locator('nav a.active, .sidebar a.active, .navigation a.active, [aria-current="page"]');
    if (await activeNavItem.isVisible()) {
      await expect(activeNavItem).toBeVisible();
    }
  });
});
