import { render, screen } from '@testing-library/react';
import React from 'react';

// Virtual mock to bypass resolving ESM react-router-dom in CRA's Jest
jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <>{children}</>,
    Route: ({ element, children }) => <>{element || children}</>,
    Navigate: () => null,
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  }),
  { virtual: true }
);

// Mock pages/components that import ESM-only libs (axios, firebase) to avoid transform issues
jest.mock('./pages/HomePage', () => () => <div>ChemConcept Bridge</div>);
jest.mock('./pages/LoginPage', () => () => <div>Login Page</div>);
jest.mock('./pages/RegisterPage', () => () => <div>Register Page</div>);
jest.mock('./components/Dashboard/Dashboard', () => () => <div>Dashboard</div>);
jest.mock('./pages/ForgotPassword', () => () => <div>Forgot Password</div>);
jest.mock('./pages/ResetPassword', () => () => <div>Reset Password</div>);
jest.mock('./pages/QuizStatsPage', () => () => <div>Quiz Stats</div>);
jest.mock('./pages/StudentProgressPage', () => () => <div>Student Progress</div>);

import App from './App';

test('renders homepage brand text', () => {
  render(<App />);
  expect(screen.getByText(/ChemConcept Bridge/i)).toBeInTheDocument();
});
