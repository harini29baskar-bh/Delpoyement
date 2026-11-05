# V2 CodeZero — Project Context

## Architecture
React/Vite frontend -> Express REST API -> MongoDB via Mongoose.

## Implemented in this starter
- Role-based student/admin accounts
- Access requests and admin approval
- Activation/password-reset token flow
- Seeded the exact 10-phase / 200-problem roadmap from the supplied PDF, with LeetCode IDs, difficulty, pattern labels and individual problem URLs
- Problem search/filter UI
- Completion tracking and one-time XP ledger
- Phase unlock rule (100% previous phase)
- Notes and revision CRUD
- Leaderboard
- Admin overview and student status management

## Requires configuration
- MongoDB URI
- Admin bootstrap environment variables
- SMTP credentials for real email delivery
- Production hosting URLs and HTTPS

## Known limitations
- Analytics are basic aggregates, not a full BI suite.
- Streak/daily goal calculations are basic and should be reviewed for timezone-specific production requirements.
- No online code editor or code execution (intentional; LeetCode is external).
- This starter has not undergone independent security or load testing.
