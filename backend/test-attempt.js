const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const BASE = process.env.BACKEND_URL || 'http://localhost:10000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function run() {
  try {
    // Login
    console.log('Logging in...');
    let res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    if (!res.ok) {
      console.error('Login failed:', await res.text());
      return;
    }
    const login = await res.json();
    const token = login.token;
    console.log('Received token (truncated):', token ? token.slice(0,40) + '...' : null);

    // Find our test quiz (by title)
    res = await fetch(`${BASE}/api/quiz`);
    const quizzes = await res.json();
    const quiz = quizzes.find(q => q.title && q.title.includes('Test Quiz for Remediation'));
    if (!quiz) {
      console.error('Test quiz not found. Run create-test-quiz.js first.');
      return;
    }
    console.log('Found quiz id:', quiz._id || quiz.id || quiz);

    const quizId = quiz._id || quiz.id;

    // Submit attempt selecting the WRONG option (index 0 -> 'Acid')
    const payload = {
      answers: [
        { questionId: quiz.questions[0]._id || quiz.questions[0]._id, selectedOption: 0, timeSpent: 5 }
      ],
      timeSpent: 10,
      confidenceLevel: 3
    };

    res = await fetch(`${BASE}/api/quiz/${quizId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    const attemptResp = await res.json();
    console.log('Attempt response:', JSON.stringify(attemptResp, null, 2));

    // Request remediation recommendations
    if (attemptResp.attemptId) {
      res = await fetch(`${BASE}/api/remediation/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ attemptId: attemptResp.attemptId })
      });
      const recs = await res.json();
      console.log('Remediation response:', JSON.stringify(recs, null, 2));
    }

  } catch (err) {
    console.error('Error in test attempt:', err);
  }
}

run();
