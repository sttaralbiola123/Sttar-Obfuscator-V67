const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { obfuscateWithPrometheus } = require('./obfuscate');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check for Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Obfuscate from JSON body
app.post('/obfuscate', async (req, res) => {
  try {
    const { code, preset = 'Medium' } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'No Lua code provided' });
    }
    const obfuscated = await obfuscateWithPrometheus(code, preset);
    res.json({ success: true, obfuscated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Obfuscate from file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const code = req.file.buffer.toString('utf8');
    const preset = req.body.preset || 'Medium';
    const obfuscated = await obfuscateWithPrometheus(code, preset);
    res.json({ success: true, obfuscated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
