const express = require('express');
const multer = require('multer');
const cors = require('cors');
const luaObfuscator = require('lua-obfuscator');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/healthz', (req, res) => res.send('OK'));

// Obfuscation endpoint
app.post('/obfuscate', async (req, res) => {
  try {
    const { code, options = {} } = req.body;
    if (!code) return res.status(400).json({ error: 'No Lua code' });

    // Default options (pwede mong baguhin)
    const obfuscated = luaObfuscator.obfuscate(code, {
      renameVariables: true,
      renameGlobals: false,
      encryptStrings: true,
      ...options
    });

    res.json({ success: true, obfuscated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const code = req.file.buffer.toString('utf8');
    const obfuscated = luaObfuscator.obfuscate(code, { renameVariables: true, encryptStrings: true });
    res.json({ success: true, obfuscated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
