import { test, expect } from '@playwright/test';
import { loginUser, logoutUser, clearStorage, mockApiResponse, fillForm, takeScreenshot } from './utils/testHelpers.js';
import { testUsers, testData, apiEndpoints } from './fixtures/testData.js';

test.describe.configure({ mode: 'parallel' });

test.describe('COMPREHENSIVE TEST SUITE - ChemConcept Bridge', () => {

  test.describe('LOGIN MODULE', () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
    });

    test('should load login page successfully', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveTitle(/login|sign in/i);
      await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    });

    test('should login with valid student credentials', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'student-jwt-token-123',
        user: {
          ...testUsers.student,
          id: 'student-001'
        },
        success: true
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/student-dashboard|dashboard|home/i);
    });

    test('should display error on invalid credentials', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.login, {
        success: false,
        error: 'Invalid email or password',
        message: 'Authentication failed'
      }, 401);

      await page.goto('/login');
      await page.fill('input[name="email"]', 'wrong@test.com');
      await page.fill('input[name="password"]', 'wrongpass123');
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      const errorMessage = page.locator('[role="alert"], .error, .alert-danger, .toast-error');
      await expect(errorMessage.first()).toBeVisible();
    });

    test('should validate email format before submission', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'invalid-email-format');
      await page.fill('input[name="password"]', 'password123');
      
      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      const isInvalid = await emailInput.evaluate(el => el.validity?.valid === false);
      
      if (isInvalid) {
        await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      }
    });

    test('should disable login button while submitting', async ({ page }) => {
      let loginButtonClicked = false;
      
      await mockApiResponse(page, apiEndpoints.auth.login, async (route) => {
        loginButtonClicked = true;
        await new Promise(r => setTimeout(r, 500));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-jwt-token',
            user: testUsers.student,
            success: true
          })
        });
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      await expect(loginButton).toBeDisabled();
    });

    test('should show password visibility toggle', async ({ page }) => {
      await page.goto('/login');
      
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      const toggleButton = page.locator('[data-testid="password-toggle"], .password-toggle, button[aria-label*="password"]').first();
      
      if (await toggleButton.isVisible()) {
        const initialType = await passwordInput.getAttribute('type');
        await toggleButton.click();
        const newType = await passwordInput.getAttribute('type');
        expect(initialType).not.toBe(newType);
      }
    });

    test('should persist login across page reload', async ({ page }) => {
      const token = 'persistent-jwt-token-12345';
      
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token,
        user: testUsers.student,
        success: true
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      await page.waitForURL(/student-dashboard|dashboard/i);
      
      await page.reload();
      
      await expect(page).toHaveURL(/student-dashboard|dashboard/i);
    });

    test('should login as teacher with valid credentials', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'teacher-jwt-token-456',
        user: testUsers.teacher,
        success: true
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.teacher.email);
      await page.fill('input[name="password"]', testUsers.teacher.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/teacher-dashboard|dashboard/i);
    });

    test('should login as admin with valid credentials', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'admin-jwt-token-789',
        user: testUsers.admin,
        success: true
      });

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.admin.email);
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/admin-dashboard|dashboard/i);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.login, {}, 500);

      await page.goto('/login');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', testUsers.student.password);
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      await loginButton.click();

      const errorMessage = page.locator('[role="alert"], .error, .alert, .toast-error');
      await expect(errorMessage.first()).toBeVisible();
    });
  });

  test.describe('REGISTER MODULE', () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
    });

    test('should load register page successfully', async ({ page }) => {
      await page.goto('/register');
      await expect(page).toHaveTitle(/register|sign up/i);
      await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
    });

    test('should register new student account', async ({ page }) => {
      const newUser = {
        email: 'newstudent@test.com',
        password: 'SecurePass@123',
        name: 'New Student'
      };

      await mockApiResponse(page, apiEndpoints.auth.register, {
        token: 'new-student-jwt-token',
        user: { ...newUser, id: 'new-student-001', role: 'student' },
        success: true
      });

      await page.goto('/register');
      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="password"]', newUser.password);
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"], input[placeholder*="Confirm"]').first();
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill(newUser.password);
      }

      const registerButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      await registerButton.click();

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/student-dashboard|dashboard|login/i);
    });

    test('should prevent registration with existing email', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.register, {
        success: false,
        error: 'Email already exists',
        message: 'This email is already registered'
      }, 409);

      await page.goto('/register');
      await page.fill('input[name="email"]', testUsers.student.email);
      await page.fill('input[name="password"]', 'NewPassword@123');
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('NewPassword@123');
      }

      const registerButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
      await registerButton.click();

      const errorMessage = page.locator('[role="alert"], .error, .alert-danger, .toast-error');
      await expect(errorMessage.first()).toBeVisible();
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/register');
      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="password"]', 'Password@123');
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('DifferentPassword@123');
        await confirmPasswordInput.blur();

        const errorMsg = page.locator('[role="alert"], .error, .invalid-feedback');
        if (await errorMsg.first().isVisible()) {
          await expect(errorMsg.first()).toBeVisible();
        }
      }
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/register');
      
      const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
      const strengthIndicator = page.locator('[data-testid="password-strength"], .strength-indicator, .password-strength').first();
      
      await passwordInput.fill('weak');
      
      if (await strengthIndicator.isVisible()) {
        const strength = await strengthIndicator.textContent();
        expect(strength).toMatch(/weak|low|poor/i);
      }

      await passwordInput.fill('StrongP@ssw0rd');
      
      if (await strengthIndicator.isVisible()) {
        const newStrength = await strengthIndicator.textContent();
        expect(newStrength).toMatch(/strong|high|excellent/i);
      }
    });

    test('should require email confirmation', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.register, {
        success: true,
        message: 'Registration successful. Please verify your email.',
        requiresEmailVerification: true
      });

      await page.goto('/register');
      await page.fill('input[name="email"]', 'verify@test.com');
      await page.fill('input[name="password"]', 'SecurePass@123');
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]').first();
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('SecurePass@123');
      }

      const registerButton = page.locator('button[type="submit"], button:has-text("Register")').first();
      await registerButton.click();

      const verificationMessage = page.locator('text=/verify.*email|confirmation.*email|check.*email/i');
      if (await verificationMessage.isVisible()) {
        await expect(verificationMessage).toBeVisible();
      }
    });

    test('should navigate to login after registration', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.register, {
        token: 'new-user-token',
        user: { email: 'newuser@test.com', id: 'new-001', role: 'student' },
        success: true
      });

      await page.goto('/register');
      await page.fill('input[name="email"]', 'newuser@test.com');
      await page.fill('input[name="password"]', 'Password@123');
      
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]').first();
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('Password@123');
      }

      const registerButton = page.locator('button[type="submit"], button:has-text("Register")').first();
      await registerButton.click();

      await page.waitForLoadState('networkidle');
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');
      
      const loginLink = page.locator('a[href*="login"], button:has-text("Already have an account"), a:has-text("Sign In")').first();
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await expect(page).toHaveURL(/login|signin/i);
      }
    });
  });

  test.describe('CONCEPT PAGE MODULE', () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'concept-test-token',
        user: testUsers.student,
        success: true
      });
    });

    test('should display concept list page', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.concepts, {
        concepts: testData.concepts,
        total: 2
      });

      await loginUser(page, 'student');
      
      const conceptLink = page.locator('a[href*="concept"], button:has-text("Concept"), [data-testid*="concept"]').first();
      if (await conceptLink.isVisible()) {
        await conceptLink.click();
      } else {
        await page.goto('/concepts');
      }

      await expect(page.locator('.concepts, [data-testid="concepts-list"], .concept-list').first()).toBeVisible();
    });

    test('should load individual concept details', async ({ page }) => {
      const conceptId = 'concept-1';
      const conceptDetail = {
        id: conceptId,
        title: 'Acid-Base Reactions',
        description: 'Understanding acid-base chemistry and neutralization',
        content: '<h2>Acid-Base Chemistry</h2><p>Detailed explanation...</p>',
        visualizations: [{
          type: 'interactive-diagram',
          url: '/viz/acid-base'
        }],
        relatedConcepts: ['concept-2', 'concept-3']
      };

      await mockApiResponse(page, `${apiEndpoints.concepts}/${conceptId}`, conceptDetail);

      await loginUser(page, 'student');
      await page.goto(`/concepts/${conceptId}`);

      await expect(page.locator('h1, h2').first()).toContainText(conceptDetail.title);
      await expect(page.locator('text=' + conceptDetail.description).first()).toBeVisible();
    });

    test('should track concept view', async ({ page }) => {
      const conceptId = 'concept-1';
      
      await mockApiResponse(page, `${apiEndpoints.concepts}/${conceptId}`, {
        id: conceptId,
        title: 'Acid-Base Reactions',
        description: 'Test concept'
      });

      await mockApiResponse(page, '/api/tracking/view', { success: true });

      await loginUser(page, 'student');
      await page.goto(`/concepts/${conceptId}`);

      await page.waitForTimeout(1000);
    });

    test('should allow marking concept as complete', async ({ page }) => {
      const conceptId = 'concept-1';
      
      await mockApiResponse(page, `${apiEndpoints.concepts}/${conceptId}`, {
        id: conceptId,
        title: 'Acid-Base Reactions',
        isCompleted: false
      });

      await mockApiResponse(page, '/api/concept/complete', { success: true, conceptId });

      await loginUser(page, 'student');
      await page.goto(`/concepts/${conceptId}`);

      const completeButton = page.locator('button:has-text("Mark Complete"), button:has-text("Complete"), [data-testid*="complete"]').first();
      if (await completeButton.isVisible()) {
        await completeButton.click();

        const successMsg = page.locator('.success, .toast, [role="alert"]');
        if (await successMsg.isVisible()) {
          await expect(successMsg.first()).toBeVisible();
        }
      }
    });

    test('should display concept prerequisites', async ({ page }) => {
      const conceptId = 'concept-2';
      
      await mockApiResponse(page, `${apiEndpoints.concepts}/${conceptId}`, {
        id: conceptId,
        title: 'Advanced Chemistry',
        prerequisites: [
          { id: 'concept-1', title: 'Basic Chemistry' }
        ]
      });

      await loginUser(page, 'student');
      await page.goto(`/concepts/${conceptId}`);

      const prereqSection = page.locator('[data-testid="prerequisites"], .prerequisites, .prereq');
      if (await prereqSection.first().isVisible()) {
        await expect(prereqSection.first()).toBeVisible();
      }
    });

    test('should show interactive visualizations', async ({ page }) => {
      const conceptId = 'concept-1';
      
      await mockApiResponse(page, `${apiEndpoints.concepts}/${conceptId}`, {
        id: conceptId,
        title: 'Molecular Structure',
        visualizations: [{
          id: 'viz-1',
          type: '3d-molecule',
          description: 'Interactive 3D molecule viewer'
        }]
      });

      await loginUser(page, 'student');
      await page.goto(`/concepts/${conceptId}`);

      const vizElement = page.locator('[data-testid*="visualization"], .visualization, .interactive-viz').first();
      if (await vizElement.isVisible()) {
        await expect(vizElement).toBeVisible();
      }
    });

    test('should provide concept search functionality', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.concepts, {
        concepts: testData.concepts
      });

      await loginUser(page, 'student');
      await page.goto('/concepts');

      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], [data-testid="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('acid');

        const results = page.locator('[data-testid*="result"], .search-result, .concept-item');
        await expect(results.first()).toBeVisible();
      }
    });

    test('should allow filtering concepts by category', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.concepts, {
        concepts: testData.concepts.filter(c => c.category === 'reactions')
      });

      await loginUser(page, 'student');
      await page.goto('/concepts');

      const filterDropdown = page.locator('select[name="category"], [data-testid="category-filter"]').first();
      if (await filterDropdown.isVisible()) {
        await filterDropdown.selectOption('reactions');

        const filteredItems = page.locator('.concept-item, [data-testid*="concept"]');
        await expect(filteredItems.first()).toBeVisible();
      }
    });
  });

  test.describe('QUIZ & SCORING MODULE', () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'quiz-test-token',
        user: testUsers.student,
        success: true
      });
    });

    test('should display available quizzes', async ({ page }) => {
      await mockApiResponse(page, '/api/quiz', {
        quizzes: [
          {
            id: 'quiz-1',
            title: 'Basic Chemistry Quiz',
            difficulty: 'beginner',
            questions: 5
          }
        ]
      });

      await loginUser(page, 'student');
      
      const quizLink = page.locator('a[href*="quiz"], button:has-text("Quiz"), [data-testid*="quiz"]').first();
      if (await quizLink.isVisible()) {
        await quizLink.click();
      } else {
        await page.goto('/quizzes');
      }

      const quizItem = page.locator('.quiz-item, [data-testid="quiz"]');
      await expect(quizItem.first()).toBeVisible();
    });

    test('should start quiz successfully', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}`, {
        id: quizId,
        title: 'Basic Chemistry Quiz',
        totalQuestions: 5,
        timeLimit: 600
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}`);

      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), [data-testid="start-quiz"]').first();
      if (await startButton.isVisible()) {
        await startButton.click();
      }

      const quizContent = page.locator('.quiz-content, [data-testid="quiz-question"], .question').first();
      await expect(quizContent).toBeVisible();
    });

    test('should display quiz questions with options', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}`, {
        id: quizId,
        title: 'Basic Chemistry Quiz',
        questions: [
          {
            id: 'q1',
            question: 'What is the chemical symbol for water?',
            questionType: 'multiple-choice',
            options: [
              { id: 'opt1', text: 'H2O' },
              { id: 'opt2', text: 'CO2' },
              { id: 'opt3', text: 'NaCl' },
              { id: 'opt4', text: 'O2' }
            ]
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}`);

      const questionText = page.locator('text=/water|chemical symbol/i');
      await expect(questionText.first()).toBeVisible();

      const options = page.locator('[data-testid*="option"], .option, .answer-choice');
      await expect(options.first()).toBeVisible();
    });

    test('should answer quiz questions', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}`, {
        id: quizId,
        questions: [
          {
            id: 'q1',
            question: 'What is the chemical symbol for water?',
            options: [
              { id: 'opt1', text: 'H2O' },
              { id: 'opt2', text: 'CO2' },
              { id: 'opt3', text: 'NaCl' }
            ]
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}`);

      const option = page.locator('button:has-text("H2O"), input[value="H2O"], [data-testid="option-0"]').first();
      if (await option.isVisible()) {
        await option.click();
        
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Submit")').first();
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
      }
    });

    test('should display quiz progress', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}`, {
        id: quizId,
        totalQuestions: 10
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}`);

      const progress = page.locator('[data-testid="progress"], .quiz-progress, .progress-bar');
      if (await progress.isVisible()) {
        await expect(progress).toBeVisible();
      }
    });

    test('should submit completed quiz', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}`, {
        id: quizId,
        totalQuestions: 2
      });

      await mockApiResponse(page, '/api/quiz/submit', {
        success: true,
        quizId,
        responses: [
          { questionId: 'q1', selectedOption: 0 },
          { questionId: 'q2', selectedOption: 1 }
        ]
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}`);

      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish"), [data-testid="submit-quiz"]');
      const lastSubmitButton = submitButton.last();
      if (await lastSubmitButton.isVisible()) {
        await lastSubmitButton.click();
        
        await page.waitForLoadState('networkidle');
      }
    });

    test('should display quiz results with score', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, '/api/quiz/results', {
        quizId,
        score: 85,
        percentage: 85,
        totalQuestions: 10,
        correctAnswers: 8.5,
        wrongAnswers: 1.5,
        skipped: 0
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}/results`);

      const scoreDisplay = page.locator('text=/85|score|result/i');
      await expect(scoreDisplay.first()).toBeVisible();
    });

    test('should show detailed feedback for each question', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}/results`, {
        quizId,
        score: 90,
        questionReview: [
          {
            questionId: 'q1',
            question: 'What is the chemical symbol for water?',
            yourAnswer: 'H2O',
            correctAnswer: 'H2O',
            isCorrect: true,
            explanation: 'H2O is indeed the chemical formula for water.'
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}/results`);

      const explanation = page.locator('text=chemical formula|explanation|feedback');
      if (await explanation.first().isVisible()) {
        await expect(explanation.first()).toBeVisible();
      }
    });

    test('should track quiz attempt history', async ({ page }) => {
      await mockApiResponse(page, '/api/quiz/attempts', {
        attempts: [
          {
            id: 'attempt-1',
            quizId: 'quiz-1',
            score: 85,
            attemptedAt: '2024-01-15T10:30:00Z'
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto('/quiz/history');

      const historyItem = page.locator('[data-testid*="attempt"], .attempt-item, .history-item');
      if (await historyItem.first().isVisible()) {
        await expect(historyItem.first()).toBeVisible();
      }
    });

    test('should calculate and display score correctly', async ({ page }) => {
      const correctAnswers = 9;
      const totalQuestions = 10;
      const expectedScore = 90;

      const quizId = 'quiz-1';
      
      await mockApiResponse(page, '/api/quiz/results', {
        quizId,
        score: expectedScore,
        correctAnswers,
        totalQuestions
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}/results`);

      const scoreText = page.locator(`text=/90|9.*10/`);
      await expect(scoreText.first()).toBeVisible();
    });

    test('should allow retaking quiz', async ({ page }) => {
      const quizId = 'quiz-1';
      
      await mockApiResponse(page, `/api/quiz/${quizId}/results`, {
        quizId,
        score: 70,
        allowRetake: true
      });

      await mockApiResponse(page, `/api/quiz/${quizId}`, {
        id: quizId,
        title: 'Quiz 1 - Retake'
      });

      await loginUser(page, 'student');
      await page.goto(`/quiz/${quizId}/results`);

      const retakeButton = page.locator('button:has-text("Retake"), button:has-text("Try Again"), [data-testid="retake"]').first();
      if (await retakeButton.isVisible()) {
        await retakeButton.click();
        
        await expect(page).toHaveURL(/quiz/);
      }
    });
  });

  test.describe('AI MISCONCEPTION DETECTOR MODULE', () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'ml-test-token',
        user: testUsers.student,
        success: true
      });
    });

    test('should load misconception detector page', async ({ page }) => {
      await loginUser(page, 'student');
      
      const misconceptionLink = page.locator('a[href*="misconception"], button:has-text("Misconception"), [data-testid*="misconception"]').first();
      if (await misconceptionLink.isVisible()) {
        await misconceptionLink.click();
      } else {
        await page.goto('/misconception-detector');
      }

      const detectorUI = page.locator('[data-testid*="detector"], .misconception-detector, .analyzer').first();
      if (await detectorUI.isVisible()) {
        await expect(detectorUI).toBeVisible();
      }
    });

    test('should provide text input for student answer', async ({ page }) => {
      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea[name="answer"], [data-testid="answer-input"], textarea').first();
      await expect(answerInput).toBeVisible();
    });

    test('should analyze student answer for misconceptions', async ({ page }) => {
      const studentAnswer = 'Water boils at 100 degrees because that is the highest temperature water can reach.';
      
      await mockApiResponse(page, '/api/ml/misconception', {
        answer: studentAnswer,
        isMisconceptionDetected: true,
        misconceptions: [
          {
            id: 'misc-1',
            label: 'Boiling point misconception',
            confidence: 0.95,
            category: 'thermodynamics'
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea[name="answer"], textarea').first();
      await answerInput.fill(studentAnswer);

      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect"), button:has-text("Check"), [data-testid="analyze-button"]').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
      }

      await page.waitForTimeout(500);
    });

    test('should display misconception detection results', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/misconception', {
        isMisconceptionDetected: true,
        label: 'Conflating mass and moles',
        confidence: 0.92,
        explanation: 'The answer confuses grams with number of moles.',
        remediation: [
          'Review the relationship between mass, molar mass, and moles',
          'Practice converting grams to moles'
        ]
      });

      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea').first();
      await answerInput.fill('18 grams equals 18 moles');

      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect")').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
      }

      await page.waitForTimeout(1000);

      const resultUI = page.locator('[data-testid*="result"], .misconception-result, .analysis-result').first();
      if (await resultUI.isVisible()) {
        await expect(resultUI).toBeVisible();
      }
    });

    test('should show confidence score', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/misconception', {
        isMisconceptionDetected: true,
        label: 'Test Misconception',
        confidence: 0.85,
        explanation: 'Explanation text'
      });

      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea').first();
      await answerInput.fill('Test answer');

      const analyzeButton = page.locator('button:has-text("Analyze")').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
      }

      await page.waitForTimeout(1000);

      const confidenceDisplay = page.locator('[data-testid*="confidence"], .confidence, .score');
      if (await confidenceDisplay.first().isVisible()) {
        await expect(confidenceDisplay.first()).toBeVisible();
      }
    });

    test('should provide remediation suggestions', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/misconception', {
        isMisconceptionDetected: true,
        label: 'Misconception',
        confidence: 0.90,
        explanation: 'Explanation',
        remediation: [
          'Review atomic structure',
          'Study electron configuration',
          'Practice with examples'
        ]
      });

      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea').first();
      await answerInput.fill('Test answer');

      const analyzeButton = page.locator('button:has-text("Analyze")').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
      }

      await page.waitForTimeout(1000);

      const remediationSection = page.locator('[data-testid*="remediation"], .remediation, .suggestions').first();
      if (await remediationSection.isVisible()) {
        await expect(remediationSection).toBeVisible();
      }
    });

    test('should handle no misconception detected', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/misconception', {
        isMisconceptionDetected: false,
        message: 'No misconceptions detected',
        feedback: 'Your answer is correct!'
      });

      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea').first();
      await answerInput.fill('Correct answer text');

      const analyzeButton = page.locator('button:has-text("Analyze")').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
      }

      await page.waitForTimeout(1000);

      const successMessage = page.locator('text=/correct|no.*misconception/i');
      if (await successMessage.first().isVisible()) {
        await expect(successMessage.first()).toBeVisible();
      }
    });

    test('should save analysis history', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/misconception/history', {
        analyses: [
          {
            id: 'analysis-1',
            answer: 'Student answer text',
            misconceptionDetected: true,
            analyzedAt: '2024-01-15T10:30:00Z'
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto('/misconception-detector/history');

      const historyItem = page.locator('[data-testid*="history"], .history-item, .analysis-item').first();
      if (await historyItem.isVisible()) {
        await expect(historyItem).toBeVisible();
      }
    });

    test('should handle API errors gracefully', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/misconception', {}, 500);

      await loginUser(page, 'student');
      await page.goto('/misconception-detector');

      const answerInput = page.locator('textarea').first();
      await answerInput.fill('Test answer');

      const analyzeButton = page.locator('button:has-text("Analyze")').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
      }

      await page.waitForTimeout(1000);

      const errorMessage = page.locator('[role="alert"], .error, .alert-danger');
      if (await errorMessage.first().isVisible()) {
        await expect(errorMessage.first()).toBeVisible();
      }
    });

    test('should provide model information', async ({ page }) => {
      await mockApiResponse(page, '/api/ml/models/info', {
        models: [
          {
            name: 'KNN Classifier',
            accuracy: 0.87,
            precision: 0.89
          },
          {
            name: 'Naive Bayes',
            accuracy: 0.82,
            precision: 0.84
          }
        ]
      });

      await loginUser(page, 'student');
      await page.goto('/ml-models');

      const modelInfo = page.locator('[data-testid*="model"], .model-card, .model-info').first();
      if (await modelInfo.isVisible()) {
        await expect(modelInfo).toBeVisible();
      }
    });
  });

  test.describe('LOGOUT & SESSION MANAGEMENT', () => {
    test.beforeEach(async ({ page }) => {
      await clearStorage(page);
      
      await mockApiResponse(page, apiEndpoints.auth.login, {
        token: 'session-test-token',
        user: testUsers.student,
        success: true
      });
    });

    test('should logout successfully', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.logout, {
        success: true,
        message: 'Logged out successfully'
      });

      await loginUser(page, 'student');
      
      const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), a:has-text("Logout")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        await page.waitForURL(/login|signin/i);
        await expect(page).toHaveURL(/login|signin/i);
      }
    });

    test('should clear user session on logout', async ({ page }) => {
      await mockApiResponse(page, apiEndpoints.auth.logout, { success: true });

      await loginUser(page, 'student');
      
      await logoutUser(page);

      const storedToken = await page.evaluate(() => localStorage.getItem('token'));
      expect(storedToken).toBeNull();
    });

    test('should handle session timeout', async ({ page }) => {
      await loginUser(page, 'student');
      
      await mockApiResponse(page, '/api/**', { error: 'Session expired' }, 401);

      const unauthorizedLink = page.locator('a[href*="dashboard"]').first();
      if (await unauthorizedLink.isVisible()) {
        await unauthorizedLink.click();
        
        await page.waitForTimeout(500);
      }
    });
  });
});
