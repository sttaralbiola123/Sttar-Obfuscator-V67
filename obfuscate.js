const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);

async function obfuscateWithPrometheus(inputCode, preset = 'Medium') {
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.lua`);
  const outputFile = path.join(tempDir, `output_${Date.now()}.lua`);

  try {
    await fs.writeFile(inputFile, inputCode, 'utf8');
    // Eto na ang tamang command, gamit ang @gamely/prometheus-cli
    const command = `npx @gamely/prometheus-cli ${inputFile} --preset ${preset} --output ${outputFile}`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.warn('CLI stderr:', stderr);
    }
    if (stdout) {
      console.log('CLI stdout:', stdout);
    }

    const obfuscatedCode = await fs.readFile(outputFile, 'utf8');
    return obfuscatedCode;
  } catch (error) {
    console.error('Obfuscation error:', error);
    throw new Error(`Obfuscation failed: ${error.message}`);
  } finally {
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
  }
}

module.exports = { obfuscateWithPrometheus };
