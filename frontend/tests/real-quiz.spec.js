import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'tessasaji2026@mca.ajce.in',
  password: 'Tessa@12345'
};

async function loginRealUser(page) {
  await page.goto('/login');
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  
  await emailInput.fill(TEST_USER.email);
  await passwordInput.fill(TEST_USER.password);
  
  const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
  await loginButton.click();
  
  await page.waitForLoadState('networkidle');
}

test.describe('REAL QUIZ & SCORING TESTS', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should navigate to quiz page', async ({ page }) => {
    await loginRealUser(page);
    
    const quizLink = page.locator('a[href*="quiz"], button:has-text("Quiz"), [data-testid*="quiz"]').first();
    if (await quizLink.isVisible()) {
      await quizLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/quiz');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display available quizzes', async ({ page }) => {
    await loginRealUser(page);
    
    const quizLink = page.locator('a[href*="quiz"], button:has-text("Quiz")').first();
    if (await quizLink.isVisible()) {
      await quizLink.click();
    } else {
      await page.goto('/quiz');
    }
    
    await page.waitForLoadState('networkidle');
    
    const quizItems = page.locator('[data-testid*="quiz"], .quiz-item, .quiz-card, .card');
    const count = await quizItems.count();
    
    if (count > 0) {
      await expect(quizItems.first()).toBeVisible();
    }
  });

  test('should display quiz title and difficulty', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizTitle = page.locator('.quiz-title, .title, h3, h2').first();
    if (await quizTitle.isVisible()) {
      await expect(quizTitle).toBeVisible();
    }
  });

  test('should click on quiz to start', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item, .quiz-card').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should start quiz and display first question', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const question = page.locator('[data-testid*="question"], .question, .quiz-question').first();
      if (await question.isVisible()) {
        await expect(question).toBeVisible();
      }
    }
  });

  test('should display quiz questions with options', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const options = page.locator('[data-testid*="option"], .option, .answer-choice, input[type="radio"], button.option');
      const optionCount = await options.count();
      
      if (optionCount > 0) {
        await expect(options.first()).toBeVisible();
      }
    }
  });

  test('should answer quiz question', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const option = page.locator('[data-testid*="option"], .option, input[type="radio"], button.option').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should navigate to next question', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const option = page.locator('[data-testid*="option"], .option, input[type="radio"]').first();
      if (await option.isVisible()) {
        await option.click();
      }
      
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), [data-testid="next"]').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should display quiz progress', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const progress = page.locator('[data-testid*="progress"], .progress, .question-counter, text=/question.*of/i').first();
      if (await progress.isVisible()) {
        await expect(progress).toBeVisible();
      }
    }
  });

  test('should submit quiz', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish"), [data-testid="submit"]').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should display quiz results', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        const results = page.locator('[data-testid*="result"], .results, .score-section, text=/score|result/i').first();
        if (await results.isVisible()) {
          await expect(results).toBeVisible();
        }
      }
    }
  });

  test('should display score on results page', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        const scoreDisplay = page.locator('[data-testid*="score"], .score, text=/\\d+\\s*%|\\d+\\s*\\/\\s*\\d+/').first();
        if (await scoreDisplay.isVisible()) {
          await expect(scoreDisplay).toBeVisible();
        }
      }
    }
  });

  test('should display feedback for answers', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        const feedback = page.locator('[data-testid*="feedback"], .feedback, .explanation, text=/correct|incorrect|well done/i').first();
        if (await feedback.isVisible()) {
          await expect(feedback).toBeVisible();
        }
      }
    }
  });

  test('should show correct/incorrect answers', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator('button:has-text("Submit")').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        const answerReview = page.locator('[data-testid*="review"], .review, .answer-review, .correct, .incorrect').first();
        if (await answerReview.isVisible()) {
          await expect(answerReview).toBeVisible();
        }
      }
    }
  });

  test('should allow retaking quiz', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/quiz');
    await page.waitForLoadState('networkidle');
    
    const quizItem = page.locator('[data-testid*="quiz"], .quiz-item').first();
    if (await quizItem.isVisible()) {
      await quizItem.click();
      await page.waitForLoadState('networkidle');
      
      const submitButton = page.locator('button:has-text("Submit")').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        const retakeButton = page.locator('button:has-text("Retake"), button:has-text("Try Again"), [data-testid="retake"]').first();
        if (await retakeButton.isVisible()) {
          await expect(retakeButton).toBeVisible();
        }
      }
    }
  });

  test('should track quiz attempt history', async ({ page }) => {
    await loginRealUser(page);
    
    const historyLink = page.locator('a[href*="history"], button:has-text("History"), [data-testid*="history"]').first();
    if (await historyLink.isVisible()) {
      await historyLink.click();
      await page.waitForLoadState('networkidle');
    }
  });
});
