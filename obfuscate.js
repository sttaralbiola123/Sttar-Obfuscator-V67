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
    // Write input code to temporary file
    await fs.writeFile(inputFile, inputCode, 'utf8');

    // Run the CLI command using npx (no need for --output, the CLI prints the result)
    const command = `npx @gamely/prometheus-cli ${inputFile} --preset ${preset}`;
    console.log(`Running: ${command}`);

    // Execute the command and capture stdout/stderr
    const { stdout, stderr } = await execPromise(command, { timeout: 30000 });

    if (stderr) {
      console.warn('CLI stderr:', stderr);
      // Only throw if it's a critical error
      if (stderr.toLowerCase().includes('error')) {
        throw new Error(stderr);
      }
    }

    // The obfuscated code should be in stdout
    let obfuscatedCode = stdout.trim();
    if (!obfuscatedCode) {
      throw new Error('No output from obfuscator');
    }

    return obfuscatedCode;
  } catch (error) {
    console.error('Obfuscation error:', error);
    throw new Error(`Obfuscation failed: ${error.message}`);
  } finally {
    // Clean up temporary file
    await fs.unlink(inputFile).catch(() => {});
  }
}

module.exports = { obfuscateWithPrometheus };
