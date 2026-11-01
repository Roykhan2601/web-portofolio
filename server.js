const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PROFILE_FILE = path.join(__dirname, 'data', 'profile.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8') || '[]');
  } catch (err) {
    return null;
  }
};

app.get('/api/profile', (req, res) => {
  const data = readJson(PROFILE_FILE);
  if (!data) return res.status(500).json({ status: 'error', pesan: 'Gagal membaca profil' });
  res.json(data);
});

app.get('/api/projects', (req, res) => {
  const data = readJson(PROJECTS_FILE);
  if (!data) return res.status(500).json({ status: 'error', pesan: 'Gagal membaca proyek' });
  res.json(data);
});

app.post('/api/contact', (req, res) => {
  const { nama, email, pesan } = req.body;
  if (!nama || !email || !pesan) {
    return res.status(400).json({ status: 'error', pesan: 'Semua kolom wajib diisi!' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ status: 'error', pesan: 'Format email tidak valid!' });
  }

  if (pesan.trim().length < 10) {
    return res.status(400).json({ status: 'error', pesan: 'Pesan minimal 10 karakter!' });
  }

  const list = readJson(MESSAGES_FILE) || [];
  list.push({ id: Date.now(), nama: nama.trim(), email: email.trim(), pesan: pesan.trim(), waktu: new Date().toISOString() });

  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2), 'utf-8');
    res.json({ status: 'success', pesan: 'Pesan Anda berhasil dikirim! Terima kasih.' });
  } catch (err) {
    res.status(500).json({ status: 'error', pesan: 'Gagal menyimpan pesan pada server.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server aktif di: http://localhost:${PORT}`);
});