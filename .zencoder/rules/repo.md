# Repository Overview

- Name: chemconcept-bridge
- Structure:
  - backend: Node.js/Express API with routes, models, middleware
  - frontend: React app with tests configured (Jest + Testing Library)
  - docs: design docs

## Frontend
- Package manager: npm (package-lock.json present)
- Key scripts likely: start, test, build (see package.json)
- Tests use jest-dom via setupTests.js

## Backend
- Express server at backend/server.js
- Routes: auth, user, admin, concept, quiz, google
- Models: Concept, Quiz, QuizAttempt, User, UserProgress
- Requires .env

## Common Tasks
- Frontend install: npm install --prefix frontend
- Frontend test: npm test --prefix frontend -- --watchAll=false
- Backend install: npm install --prefix backend
- Backend run: npm start --prefix backend (or node server.js)

## Notes
- This file was auto-generated to aid the assistant.