# V2 CodeZero

A DSA learning platform with student/admin roles, approval workflow, 10 learning phases, problem tracking, XP, notes, revision queue and leaderboard.

## Stack
- React + Vite + JavaScript + React Router
- Node.js + Express + Mongoose
- MongoDB Atlas (or local MongoDB)
- JWT authentication with HTTP-only cookie
- bcrypt password hashing

## Requirements
Node.js 20+, npm, and MongoDB (local or Atlas).

## Run locally
1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI` and a long random `JWT_SECRET`.
3. Install dependencies from the project root:
   `npm install`
4. Seed the 10 phases and 200 problems:
   `npm run seed -w backend`
5. Bootstrap the first admin:
   `npm run admin:create -w backend`
   It uses `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `backend/.env`.
6. Start both applications:
   `npm run dev`
7. Open http://localhost:5173

Backend API: http://localhost:5000/api

## Student access
Students submit an access request from the registration page. Admin approves it in the admin dashboard. For local development, activation links are printed to the backend terminal when SMTP is not configured. Configure SMTP before production use.

## Deployment
- Frontend: deploy `frontend` to Vercel; set `VITE_API_URL` to your deployed backend API URL (include `/api`).
- Backend: deploy `backend` to Render; set all variables from `.env.example`.
- Database: MongoDB Atlas; allow the Render service IP/network according to Atlas guidance.
- Set `CLIENT_URL` to the deployed frontend URL and `COOKIE_SECURE=true`.
- Configure SMTP credentials for activation and password reset email.

## Security / production checklist
This is a functional starter implementation, not a security-audited production service. Before public launch:
- Configure HTTPS, strong secrets, exact CORS origins, SMTP, backups and monitoring.
- Add a production email provider and verify deliverability.
- Add CSRF protection appropriate to the chosen cookie deployment topology.
- Run dependency and penetration testing, load testing, and accessibility checks.
- Review rate limits and session/token lifecycle for your deployment.
- Confirm the seeded LeetCode URLs and problem content meet your curriculum needs.

## Included
- Student access request, admin approval, activation, login/logout, password reset flow
- Admin/student route authorization
- Problem catalogue and phase unlocking
- Completion and one-time XP award
- Notes, revision queue, leaderboard
- Basic admin student management and audit log records

## Updated UI and local setup

The frontend has been updated with a responsive student dashboard, roadmap preview, topic library, analytics view, expanded problem filters, and admin overview visuals. Existing authentication, access approval, problem completion, notes, revisions, leaderboard, and admin APIs are retained.

### Run locally

1. Install dependencies from the project root: `npm install`
2. Copy `backend/.env.example` to `backend/.env` and set your MongoDB URI, JWT secret, admin credentials, and optional SMTP settings.
3. In `frontend/.env`, set `VITE_API_URL=http://localhost:5001/api` (or the actual backend URL).
4. Start MongoDB, then run `npm run dev` from the project root.
5. If this is a new database, run `npm run seed -w backend` once. Do not reseed a database containing existing student progress unless you have backed it up.

The Vercel rewrite file is in `frontend/vercel.json`; configure the Vercel project root as `frontend` for the frontend deployment. Configure the backend separately on Render and set its environment variables there.
