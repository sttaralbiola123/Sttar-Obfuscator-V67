const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);

async function obfuscateWithPrometheus(inputCode, preset = 'Medium') {
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.lua`);

  try {
    // Write input code to temp file
    await fs.writeFile(inputFile, inputCode, 'utf8');

    // Tamang command: walang --output, diretso stdout
    const command = `npx @gamely/prometheus-cli ${inputFile} --preset ${preset}`;
    console.log(`Running: ${command}`);

    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.warn('CLI stderr:', stderr);
    }

    // Ang stdout na mismo ang obfuscated code
    let obfuscatedCode = stdout;
    if (!obfuscatedCode || obfuscatedCode.trim() === '') {
      throw new Error('No output from obfuscator');
    }

    return obfuscatedCode;
  } catch (error) {
    console.error('Obfuscation error:', error);
    throw new Error(`Obfuscation failed: ${error.message}`);
  } finally {
    // Linisin ang temp file
    await fs.unlink(inputFile).catch(() => {});
  }
}

module.exports = { obfuscateWithPrometheus };
