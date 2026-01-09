// Script to generate separate HTML reports for each module
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const modules = [
  { name: 'Module 1: Login', file: 'module-1-login.spec.js', id: 'module1' },
  { name: 'Module 2: Registration', file: 'module-2-register.spec.js', id: 'module2' },
  { name: 'Module 3: Concepts', file: 'module-3-concepts.spec.js', id: 'module3' },
  { name: 'Module 4: Quiz & Scoring', file: 'module-4-quiz-scoring.spec.js', id: 'module4' },
  { name: 'Module 5: AI Misconception', file: 'module-5-misconception.spec.js', id: 'module5' },
  { name: 'Module 6: Performance Dashboard', file: 'module-6-performance.spec.js', id: 'module6' }
];

const reportsDir = path.join(__dirname, '..', 'module-reports');
const mainReportDir = path.join(__dirname, '..', 'playwright-report');

// Create reports directory
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('🚀 Generating separate reports for each module...\n');

// Run each module test and generate report
modules.forEach((module, index) => {
  console.log(`\n[${index + 1}/6] Running ${module.name}...`);
  
  try {
    // Run test for this module
    execSync(
      `npx playwright test tests/${module.file} --project=chromium --reporter=html --output-dir=test-results/${module.id}`,
      { 
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        env: { ...process.env, CI: 'false' }
      }
    );
    
    // Copy report to module-specific folder
    const moduleReportDir = path.join(reportsDir, module.id);
    if (fs.existsSync(mainReportDir)) {
      if (!fs.existsSync(moduleReportDir)) {
        fs.mkdirSync(moduleReportDir, { recursive: true });
      }
      // Copy report files
      const reportFiles = fs.readdirSync(mainReportDir);
      reportFiles.forEach(file => {
        const src = path.join(mainReportDir, file);
        const dest = path.join(moduleReportDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, dest);
        }
      });
    }
    
    console.log(`✅ ${module.name} completed`);
  } catch (error) {
    console.error(`❌ ${module.name} failed:`, error.message);
  }
});

// Generate index page linking to all module reports
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Modules Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: rgba(255,255,255,0.9);
            text-align: center;
            margin-bottom: 40px;
            font-size: 1.1em;
        }
        .modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .module-card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        .module-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        .module-number {
            font-size: 3em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .module-name {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
        .module-description {
            color: #666;
            font-size: 0.95em;
            line-height: 1.6;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            margin-top: 15px;
        }
        .status.ready {
            background: #10b981;
            color: white;
        }
        .footer {
            text-align: center;
            color: rgba(255,255,255,0.8);
            margin-top: 50px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Modules Dashboard</h1>
        <p class="subtitle">ChemConcept Bridge - All Testing Modules</p>
        
        <div class="modules-grid">
            ${modules.map((module, index) => `
            <a href="${module.id}/index.html" class="module-card">
                <div class="module-number">${index + 1}</div>
                <div class="module-name">${module.name}</div>
                <div class="module-description">
                    ${getModuleDescription(module.id)}
                </div>
                <span class="status ready">View Report →</span>
            </a>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Credentials: tessasaji2026@mca.ajce.in</p>
        </div>
    </div>
</body>
</html>`;

function getModuleDescription(id) {
  const descriptions = {
    module1: 'Login functionality with valid credentials and dashboard redirect',
    module2: 'User registration flow with form validation',
    module3: 'Concept page navigation, viewing, and interaction',
    module4: 'Quiz taking, answering questions, and score verification',
    module5: 'AI-powered misconception detection and analysis',
    module6: 'Performance metrics, charts, and analytics dashboard'
  };
  return descriptions[id] || 'Test module report';
}

fs.writeFileSync(path.join(reportsDir, 'index.html'), indexHtml);

console.log('\n✅ All module reports generated!');
console.log(`\n📊 Open the main dashboard: file://${path.join(reportsDir, 'index.html')}`);
console.log('\nIndividual module reports:');
modules.forEach((module, index) => {
  console.log(`  ${index + 1}. ${module.name}: file://${path.join(reportsDir, module.id, 'index.html')}`);
});


