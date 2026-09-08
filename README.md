# Sidhi Gym Tracker (MongoDB)

Roz ka gym log. Data **MongoDB** me save hota hai.

## Flow

1. Gym entry time + aaj ka weight
2. 1 hour ke baad exercise note
3. Treadmill se pehle
4. Treadmill ke baad
5. **Aaj ka workout khatam**
6. Niche dikhega: aaj itna kg, kal se **ghata / badha**

Date ke saath day bhi dikhta hai.

## Split

- Monday — Chest and triceps
- Tuesday — Back and biceps
- Wednesday — Shoulders and legs
- Thursday — Chest and triceps
- Friday — Back and biceps
- Saturday — Shoulders and triceps
- Sunday — Off

## Local run

```bash
cp .env.example .env
# .env me MONGODB_URI, LOGIN_USER, LOGIN_PASS daalo
npm install
npm start
```

Browser: http://localhost:3000

## Deploy (Render / Railway / Heroku)

Env vars:

- `MONGODB_URI` — Atlas connection string
- `LOGIN_USER` — jo ID se login karoge
- `LOGIN_PASS` — password
- `PORT` — host khud set karta hai

GitHub Pages akela Mongo nahi jod sakta. Pages use karo to API URL me Render wala link daalna.

Repo: https://github.com/SIDHIMUSIC/sidhi-gym-tracker
