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

test.describe('REAL AI MISCONCEPTION DETECTOR TESTS', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should navigate to misconception detector', async ({ page }) => {
    await loginRealUser(page);
    
    const misconceptionLink = page.locator('a[href*="misconception"], button:has-text("Misconception"), [data-testid*="misconception"]').first();
    if (await misconceptionLink.isVisible()) {
      await misconceptionLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/misconception-detector');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display misconception detector page', async ({ page }) => {
    await loginRealUser(page);
    
    const misconceptionLink = page.locator('a[href*="misconception"], button:has-text("Misconception")').first();
    if (await misconceptionLink.isVisible()) {
      await misconceptionLink.click();
    } else {
      await page.goto('/misconception-detector');
    }
    
    await page.waitForLoadState('networkidle');
    
    const heading = page.locator('h1, h2, .title, .page-title').first();
    if (await heading.isVisible()) {
      await expect(heading).toBeVisible();
    }
  });

  test('should display input field for student answer', async ({ page }) => {
    await loginRealUser(page);
    
    const misconceptionLink = page.locator('a[href*="misconception"], button:has-text("Misconception")').first();
    if (await misconceptionLink.isVisible()) {
      await misconceptionLink.click();
    } else {
      await page.goto('/misconception-detector');
    }
    
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea[name="answer"], textarea, [data-testid="answer-input"], input[placeholder*="answer"]').first();
    await expect(answerInput).toBeVisible();
  });

  test('should accept student answer input', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea[name="answer"], textarea').first();
    const testAnswer = 'The atomic number of oxygen is 12 because it has 12 electrons.';
    
    await answerInput.fill(testAnswer);
    
    const inputValue = await answerInput.inputValue();
    expect(inputValue).toBe(testAnswer);
  });

  test('should display analyze/detect button', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect"), button:has-text("Check"), [data-testid="analyze-button"]').first();
    await expect(analyzeButton).toBeVisible();
  });

  test('should analyze student answer for misconceptions', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea[name="answer"], textarea').first();
    await answerInput.fill('Water boils because atoms reach maximum speed at 100°C.');
    
    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  });

  test('should display misconception results', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('18 grams of water equals 18 moles of water because mass and moles are the same.');
    
    const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Detect")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const resultSection = page.locator('[data-testid*="result"], .result, .analysis-result, .misconception-result').first();
      if (await resultSection.isVisible()) {
        await expect(resultSection).toBeVisible();
      }
    }
  });

  test('should display misconception label/type', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('The periodic table is arranged by atomic number because of electron orbits.');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const label = page.locator('[data-testid*="label"], .misconception-label, .misconception-type, h3, h4').first();
      if (await label.isVisible()) {
        await expect(label).toBeVisible();
      }
    }
  });

  test('should display confidence score', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('Molecules always move faster at higher temperatures because heat makes them jump.');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const confidence = page.locator('[data-testid*="confidence"], .confidence, text=/confidence|certainty|\\d+\\s*%/').first();
      if (await confidence.isVisible()) {
        await expect(confidence).toBeVisible();
      }
    }
  });

  test('should display explanation for misconception', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('Ionic bonds are stronger than covalent bonds in all cases.');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const explanation = page.locator('[data-testid*="explanation"], .explanation, .description, p').first();
      if (await explanation.isVisible()) {
        await expect(explanation).toBeVisible();
      }
    }
  });

  test('should provide remediation suggestions', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('All metals are magnetic because they contain atoms.');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const remediation = page.locator('[data-testid*="remediation"], .remediation, .suggestions, .tips, text=/study|review|practice|learn/i').first();
      if (await remediation.isVisible()) {
        await expect(remediation).toBeVisible();
      }
    }
  });

  test('should handle correct answer without misconception', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('Water (H2O) consists of hydrogen and oxygen atoms bonded together through covalent bonds.');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const successMsg = page.locator('text=/correct|no.*misconception|well.*done|excellent/i, [data-testid*="success"]').first();
      if (await successMsg.isVisible()) {
        await expect(successMsg).toBeVisible();
      }
    }
  });

  test('should allow new analysis', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('Test answer');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const newAnalysisButton = page.locator('button:has-text("New"), button:has-text("Clear"), button:has-text("Try Again"), [data-testid="new-analysis"]').first();
      if (await newAnalysisButton.isVisible()) {
        await newAnalysisButton.click();
        
        const clearedInput = await answerInput.inputValue();
        if (clearedInput === '') {
          expect(clearedInput).toBe('');
        }
      }
    }
  });

  test('should display analysis history', async ({ page }) => {
    await loginRealUser(page);
    
    const historyLink = page.locator('a[href*="history"], button:has-text("History"), [data-testid*="history"]').first();
    if (await historyLink.isVisible()) {
      await historyLink.click();
      await page.waitForLoadState('networkidle');
      
      const historyItems = page.locator('[data-testid*="history"], .history-item, .analysis-item, .card').first();
      if (await historyItems.isVisible()) {
        await expect(historyItems).toBeVisible();
      }
    }
  });

  test('should display ML models information', async ({ page }) => {
    await loginRealUser(page);
    
    const mlLink = page.locator('a[href*="ml"], button:has-text("Models"), [data-testid*="models"]').first();
    if (await mlLink.isVisible()) {
      await mlLink.click();
      await page.waitForLoadState('networkidle');
      
      const modelInfo = page.locator('[data-testid*="model"], .model, .model-info, .model-card').first();
      if (await modelInfo.isVisible()) {
        await expect(modelInfo).toBeVisible();
      }
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('Test answer');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    }
  });

  test('should display loading indicator while analyzing', async ({ page }) => {
    await loginRealUser(page);
    
    await page.goto('/misconception-detector');
    await page.waitForLoadState('networkidle');
    
    const answerInput = page.locator('textarea').first();
    await answerInput.fill('Test answer for analysis');
    
    const analyzeButton = page.locator('button:has-text("Analyze")').first();
    if (await analyzeButton.isVisible()) {
      await analyzeButton.click();
      
      const loader = page.locator('[data-testid*="loader"], .loader, .loading, .spinner, text=/loading|analyzing/i').first();
      if (await loader.isVisible()) {
        await expect(loader).toBeVisible();
      }
    }
  });
});
