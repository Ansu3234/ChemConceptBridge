# Teacher Dashboard — Design (Quizzes, Concepts, Students)

Last updated: today

## 1) Overview

This document covers the UI/UX and technical design for features implemented today:
- **Quizzes**: create, inline edit, soft delete (teacher can modify own; admin can modify any)
- **Concepts**: create, inline edit (delete hidden for non-admin; admin-only delete)
- **Students**: teachers/admins can add students; roster merges assigned students with attempt-derived students

Goals:
- Maintain a clear, simple dashboard for teachers
- Enforce role-based access at API and surface correct affordances in UI
- Keep the system extensible for invitations, unassign, pagination, and search

---

## 2) UI/UX Design

### 2.1 Navigation and Layout
- **Tabs**: Quizzes | Concepts | Students
- **Cards**: Summary stats (counts), recent activity
- **Feedback**: Inline error banners and optimistic button states (Loading…, Creating…)

### 2.2 Quizzes Tab
- **List**: Teacher’s quizzes (title, topic, difficulty) with actions:
  - **Edit**: Inline form replaces the row
  - **Delete**: Soft delete confirmation → deactivates quiz
  - **Stats link**: “View Stats →” navigates to quiz stats
- **Create form**: Title, description, topic, difficulty, duration, simple single-question fields
- **Empty state**: “No quizzes yet.”
- **Refresh**: Re-fetches quizzes

Validation and UX notes:
- Required fields: title, description, topic, difficulty, duration
- Keep edits local state; Cancel restores read-only row
- Show clear errors from API (403, 404, validation)

### 2.3 Concepts Tab
- **List**: Teacher’s concepts with actions:
  - **Edit**: Inline, same pattern as quizzes
  - **Delete**: Shown only if user.role === 'admin'; otherwise hidden
- **Create form**: Title, description, topic, difficulty, estimated time
- **Refresh** button and empty state

UX considerations:
- Align control placement with quizzes for consistency
- If backend rejects delete for non-admin, ensure button is hidden (not just disabled)

### 2.4 Students Tab
- **Add Student form**: name (optional), email (required)
- **Roster table**: Name, Email, Attempts, Avg Score, Actions (future: unassign)
- **Refresh**: Recomputes merged roster from attempts and assigned students
- **Temp password handling**: After creation, surface a small toast/banner with the temporary password and advice to use Forgot Password to reset.

Accessibility & Responsiveness:
- Forms are keyboard-friendly; inputs have labels/placeholders
- Inline edit uses focus management to move focus to the first input
- Table collapses gracefully on small screens (stacked rows or horizontal scroll)

---

## 3) Information Architecture

- **Quizzes**: isActive used for soft delete; stats link available per row
- **Concepts**: Similar structure to quizzes; delete restricted
- **Students**: Roster = union of (a) explicitly assigned students and (b) students inferred from attempts; aggregated via Map by user id/email

---

## 4) API Design & Contracts

Base URL prefix: `/api`

### 4.1 Quizzes
- **PUT /quiz/:id** (teacher/admin)
  - Request: Partial quiz payload to update fields
  - AuthZ: teacher can only edit own (createdBy === user.id); admin can edit any
  - Response: Updated quiz
- **DELETE /quiz/:id** (teacher/admin)
  - Behavior: Soft delete (`isActive=false`)
  - AuthZ: teacher can only delete own; admin can delete any
  - Response: `{ message: "Quiz deactivated successfully" }`

Schema highlights (Quiz):
- title, description, topic, difficulty (enum), duration
- questions: [{ question, options[4], correct, explanation, misconceptionTraps? }]
- createdBy: ObjectId(User)
- isActive: boolean

### 4.2 Students
- **POST /user/students** (teacher/admin)
  - Body: `{ name?, email }`
  - Behavior: Creates student with server-generated temporary password, assigns `assignedTeacher` to current user
  - Response:
    ```json
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "student",
      "assignedTeacher": "...",
      "tempPassword": "abc123xy"
    }
    ```
  - Errors: 400 (email missing or exists), 403 (role), 500 (server)
- **GET /user/students** (teacher/admin)
  - Behavior: Teacher → own assigned students; Admin → all students
  - Response: Array of `{ name, email, role, assignedTeacher, createdAt }`

### 4.3 Concepts
- Existing endpoints used for create/update; delete is admin-only (UI hides non-admin delete)

---

## 5) Frontend Architecture

- **State management**: Local component state within TeacherDashboard for inline edit forms and loading/error flags
- **API client**: Axios instance with JWT Bearer token interceptor
- **Merging roster**: Build a Map using student id/email; compute attempts and average score
- **Role-aware UI**: Conditionally render actions based on `user.role`

---

## 6) Security & Authorization
- **Backend auth**: Express middleware verifies JWT and populates `req.user`
- **Role checks**: Enforced in routes (teacher/admin for updates/deletes; admin-only deletes for concepts)
- **Password handling**: Temp password hashed with bcrypt; returned once; recommend email-based flow later

---

## 7) Edge Cases & Error Handling
- Quizzes/Concepts not found → 404 with clear message
- Teacher attempts to edit/delete another teacher’s quiz → 403
- Student email already exists → 400
- Network/server failures → surface generic error with details when safe

---

## 8) Future Enhancements
- Email invitation flow instead of returning temp password
- Unassign/remove student API + UI control
- Validation (stronger email checks, domain allowlists) and better error messages
- Pagination and search for large rosters/lists
- Bulk import students via CSV

---

## 9) Acceptance Criteria (Done)
- Teachers can inline edit and delete their quizzes (soft delete)
- Concepts editable by teachers; delete visible and usable only by admins
- Teachers can add students and see them in the roster merged with attempts-derived students
- API protected by role checks, and UI matches backend permissions