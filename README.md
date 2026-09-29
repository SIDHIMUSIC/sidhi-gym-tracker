# SIDHI GYM TRACKER

Live: **https://sidhi-gym-tracker.vercel.app**  
Repo: [SIDHIMUSIC/sidhi-gym-tracker](https://github.com/SIDHIMUSIC/sidhi-gym-tracker)

Daily gym + morning run log. Username / password MongoDB me. Token phone pe rehta hai jab tak Logout na dabao.

## Live features

- Login / create account (name, username, password, male/female)
- Home: wish, weight, streak, week report, gym vs run duration
- Workout days D1–D7 — Chest/Back/Shoulders + Abs A/B/C + animated exercise pics + YouTube
- Separate **Run** tab — GPS walk/run, history gym se alag
- Progress calendar (done = gold-mint dot), month weight graph, tap date + kg
- History row tap = full session, delete confirm
- Finish workout = weight delta popup + toast + confetti
- Offline draft: form localStorage, net aate hi sync
- Telegram summary share
- PWA: Add to Home Screen (`manifest.json` + `sw.js`)
- Profile avatar, join weight, goal kg

## Env

Vercel → Project → Settings → Environment Variables:

| Name | Value |
| --- | --- |
| `MONGODB_URI` | Atlas connection string |

Database name in app: `sidhi_gym`  
Atlas → Network Access → `0.0.0.0/0`

Optional local `.env`:

```
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/
```

## Local

```bash
npm i
node server.js
```

Open http://localhost:3000

## How to use

1. Open https://sidhi-gym-tracker.vercel.app
2. **Create account** — name + username + password (min 4) + gender
3. Roz site kholo — login save rehta hai (Logout alag button)
4. Subah **Run** tab — start / pause / end (GPS)
5. Shaam **Workout** — entry time + start kg → exercises → treadmill → end kg + end time
6. **Finish workout** — delta + confetti
7. Chrome menu → **Add to Home screen** — phone pe app icon
8. History card tap = us din ka form. X = delete confirm

## Week split

- Mon / Thu — Day 1 / 4 Chest + Triceps + Abs A
- Tue / Fri — Day 2 / 5 Back + Biceps + Abs B
- Wed / Sat — Day 3 / 6 Shoulders + Legs + Abs C
- Sun — Rest

Password Mongo me hash (scrypt), plain nahi.
