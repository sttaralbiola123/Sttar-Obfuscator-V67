const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);

async function obfuscateWithPrometheus(inputCode, preset = 'Medium') {
  // Create temp files
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.lua`);
  const outputFile = path.join(tempDir, `output_${Date.now()}.lua`);

  try {
    // Write input code to temp file
    await fs.writeFile(inputFile, inputCode, 'utf8');

    // Build command for @gally/prometheus-cli
    const command = `npx @gally/prometheus-cli --preset ${preset} --output ${outputFile} ${inputFile}`;

    // Execute obfuscation
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.warn('CLI stderr:', stderr);
    }

    // Read obfuscated result
    const obfuscatedCode = await fs.readFile(outputFile, 'utf8');
    return obfuscatedCode;
  } catch (error) {
    console.error('Obfuscation error:', error);
    throw new Error(`Obfuscation failed: ${error.message}`);
  } finally {
    // Cleanup temp files
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
  }
}

module.exports = { obfuscateWithPrometheus };
