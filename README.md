# ERP System (Employees, Attendance, Leave, Payroll)

A full-stack ERP sample including authentication, employee management, attendance, leave, and payroll modules.

## Contents

- Features
- Tech Stack
- Folder Structure
- Environment Variables
- Running the Project (Dev)
- Build & Production
- API Endpoints (Contract)
- Admin Registration Approval Flow
- Troubleshooting

## Features

- Auth (login, register) with role-based access (admin, hr, employee)
- Employees: list, detail, create, update, delete
- Attendance: mark, list with filters
- Leave: apply, list, approve/reject
- Payroll: list, detail, generate (admin/hr)

## Tech Stack

- Frontend: Next.js 16 (App Router), React 18, MUI, Axios
- Backend: Node/Express (assumed), JWT auth

## Folder Structure

```
ERP/
  frontend/        # Next.js app
  backend/         # Express API (assumed)
  README.md        # This file
```

## Environment Variables

Create `frontend/.env.local`:

```
# Base API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# If your backend uses cookie-based auth and CORS credentials
NEXT_PUBLIC_API_WITH_CREDENTIALS=false
```

If the backend differs, adjust values accordingly.

On the backend, ensure:

- CORS allows origin `http://localhost:3000`
- CORS allows headers: `Authorization, Content-Type, x-access-token`
- If cookies are used: `credentials: true` on both client and server

## Running the Project (Dev)

Frontend:

```
cd frontend
npm install
npm run dev
# http://localhost:3000
```

Backend (example):

```
cd backend
npm install
npm run dev
# http://localhost:5000
```

## Build & Production

Frontend:

```
cd frontend
npm run build
npm run start
```

Backend: follow your backend’s production process (e.g., `npm run build && npm run start`).

## API Endpoints (Contract)

Base URL: `${NEXT_PUBLIC_API_URL}` (default `http://localhost:5000/api`)

Auth

- POST `/auth/login`
  - Body: `{ email, password }`
  - Response: `{ token, user }` or `{ success, message, data: { token, user } }`
- POST `/auth/register`
  - Body: `{ name, email, password, role }` (+ optional `approvalCode`, `approvedByEmail` for admin)
  - Response: `{ message, user? }`

Employees

- GET `/employees` → `Employee[]`
- GET `/employees/:id` → `Employee`
- POST `/employees` → create `Employee`
- PUT `/employees/:id` → update `Employee`
- DELETE `/employees/:id` → `{ success: boolean }`

Attendance

- POST `/attendance` → mark attendance
- GET `/attendance?month=&year=` → `AttendanceRecord[]`
- GET `/attendance/:id` → `AttendanceRecord`

Leave

- GET `/leaves` → `LeaveRecord[]`
- POST `/leaves` → apply leave
- POST `/leaves/:id/approve` → approve leave
- POST `/leaves/:id/reject` → reject leave

Payroll

- GET `/payroll` → `PayrollSummary[]`
- GET `/payroll/:id` → `PayrollSummary`
- POST `/payroll/generate` → `PayrollSummary[]`

Headers

- Authorization: `Bearer <JWT>`
- Fallback supported: `x-access-token: <JWT>`

## Admin Registration Approval Flow

- When role `admin` is selected on register, the frontend requires:
  - `approvedByEmail`: approving admin’s email
  - `approvalCode`: one-time code/secret known to admins
- Backend should validate the approver and code, then create the admin account and store audit info (`createdBy`, `approvedBy`, timestamps).

## Troubleshooting

- Redirect loop after login
  - Ensure token is stored in `localStorage` and sent as `Authorization: Bearer <token>`.
  - Check `NEXT_PUBLIC_API_URL` points to your backend.
  - Auto-redirect on 401 is disabled in client; pages will show explicit errors now.
- Authentication error (500/401)
  - Confirm server validates JWT from `Authorization` or `x-access-token`.
  - Verify JWT secret and exp/iat on backend.
  - Confirm CORS allows origin, headers, and (if needed) credentials.
- Module not found
  - Ensure all `app/pages/*` import from `frontend/src/*` for shared components and utils.

## Notes

- The frontend normalizes API responses that may return data at either `data` or `data.data`.
- If your backend uses different routes or shapes, update the files under `frontend/lib/apis/*` accordingly.
