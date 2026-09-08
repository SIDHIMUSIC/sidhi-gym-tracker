# Sidhi Gym Tracker

Daily gym log. Username/password MongoDB me save. Vercel pe deploy.

## Vercel (1 minute)

1. [vercel.com](https://vercel.com) → Add New → Import `SIDHIMUSIC/sidhi-gym-tracker`
2. Environment Variable:
   - Name: `MONGODB_URI`
   - Value: Atlas connection string (database `sidhi_gym`)
3. Deploy
4. MongoDB Atlas → Network Access → `0.0.0.0/0` allow

## Use

1. Site kholo
2. **Create account** — username + password (min 4)
3. Roz **Enter** se login
4. Entry time + aaj ka weight → 1 hour exercise → treadmill pehle/baad
5. **Aaj ka workout khatam** — neeche ghata/badha dikhega

Split auto:

- Mon / Thu — Chest and triceps
- Tue / Fri — Back and biceps
- Wed — Shoulders and legs
- Sat — Shoulders and triceps
- Sun — Off

Password Mongo me plain nahi, hash ho ke save hota hai.
