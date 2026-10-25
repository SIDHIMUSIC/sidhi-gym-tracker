# SIDHI GYM — Full-stack edition

Dark-luxury gym and running tracker starter using Node.js, Express, MongoDB/Mongoose and JWT authentication.

## Included
- User registration and login (bcrypt password hashing; JWT access token)
- Authenticated activity history for workouts, runs and weight entries
- Create/list/delete personal activity entries
- Mobile-first PWA UI is being developed in the existing repository; this folder provides the independent API starter.

## Run locally
1. Install Node.js 20+ and create a MongoDB Atlas database.
2. Copy `.env.example` to `.env`; set `MONGODB_URI` and a strong, unique `JWT_SECRET`.
3. From this folder run `npm install`, then `npm start`.
4. API health check: `http://localhost:3000/api/health`.

## API
- `POST /api/auth/register` — `{ "name", "username", "password" }` (password minimum 8 characters)
- `POST /api/auth/login` — `{ "username", "password" }`
- `GET /api/profile` — authenticated profile
- `GET /api/entries` — authenticated activity history
- `POST /api/entries` — authenticated `{ "kind": "workout" | "run" | "weight", "date"?, "data"? }`
- `DELETE /api/entries/:id` — delete only the signed-in user's entry

Send the JWT as `Authorization: Bearer <token>`. Keep `.env` private; never commit real credentials. For production, configure HTTPS, rate limiting, request validation, and restrictive CORS before public launch.
