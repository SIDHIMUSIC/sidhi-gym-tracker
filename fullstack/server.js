import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const entrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['workout', 'run', 'weight'], required: true },
  date: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
const Entry = mongoose.model('Entry', entrySchema);

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  try {
    if (!token) throw new Error('Missing token');
    req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Please sign in again.' });
  }
}
app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'SIDHI GYM' }));
app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !/^[a-z0-9_.-]{3,24}$/.test(username) || password.length < 8)
      return res.status(400).json({ error: 'Enter a name, username (3–24 letters/numbers) and password (8+ characters).' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, username, passwordHash });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user.id, name, username } });
  } catch (e) {
    res.status(e.code === 11000 ? 409 : 500).json({ error: e.code === 11000 ? 'Username already exists.' : 'Could not create account.' });
  }
});
app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash)))
    return res.status(401).json({ error: 'Invalid username or password.' });
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, username } });
});
app.get('/api/entries', auth, async (req, res) => {
  const entries = await Entry.find({ userId: req.userId }).sort({ date: -1 }).limit(500);
  res.json(entries);
});
app.post('/api/entries', auth, async (req, res) => {
  const { kind, date, data } = req.body || {};
  if (!['workout', 'run', 'weight'].includes(kind)) return res.status(400).json({ error: 'Invalid entry type.' });
  const entry = await Entry.create({ userId: req.userId, kind, date: date ? new Date(date) : new Date(), data: data || {} });
  res.status(201).json(entry);
});
app.delete('/api/entries/:id', auth, async (req, res) => {
  const result = await Entry.deleteOne({ _id: req.params.id, userId: req.userId });
  if (!result.deletedCount) return res.status(404).json({ error: 'Entry not found.' });
  res.status(204).end();
});
app.get('/api/profile', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('name username createdAt');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});
const port = process.env.PORT || 3000;
if (process.env.MONGODB_URI && process.env.JWT_SECRET) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => app.listen(port, () => console.log(`SIDHI GYM running on :${port}`)))
    .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
} else {
  console.error('Set MONGODB_URI and JWT_SECRET in .env before starting.');
  process.exit(1);
}
