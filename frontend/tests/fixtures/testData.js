// Test data fixtures for Playwright tests
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    name: 'Test Admin'
  },
  teacher: {
    email: 'teacher@test.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Test Teacher'
  },
  student: {
    email: 'student@test.com',
    password: 'student123',
    role: 'student',
    name: 'Test Student'
  }
};

export const testData = {
  concepts: [
    {
      title: 'Acid-Base Reactions',
      description: 'Understanding acid-base chemistry',
      category: 'reactions'
    },
    {
      title: 'Periodic Table',
      description: 'Elements and their properties',
      category: 'fundamentals'
    }
  ],
  quizzes: [
    {
      title: 'Basic Chemistry Quiz',
      questions: [
        {
          question: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 0
        }
      ]
    }
  ]
};

export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout'
  },
  concepts: '/api/concept',
  quizzes: '/api/quiz',
  users: '/api/user'
};
