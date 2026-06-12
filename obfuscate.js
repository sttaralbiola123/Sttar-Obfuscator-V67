const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);

async function obfuscateWithPrometheus(inputCode, preset = 'Medium') {
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.lua`);
  const outputFile = path.join(tempDir, `input_${Date.now()}.obfuscated.lua`);

  try {
    // Isulat ang input code
    await fs.writeFile(inputFile, inputCode, 'utf8');

    // Patakbuhin ang Prometheus na may --output
    const command = `npx @gamely/prometheus-cli ${inputFile} --preset ${preset} --output ${outputFile}`;
    console.log('Running:', command);
    
    const { stdout, stderr } = await execPromise(command);
    if (stderr) console.warn('CLI stderr:', stderr);
    if (stdout) console.log('CLI stdout:', stdout);

    // Basahin ang obfuscated code mula sa output file
    const obfuscatedCode = await fs.readFile(outputFile, 'utf8');
    return obfuscatedCode;
  } catch (error) {
    console.error('Obfuscation error:', error);
    throw new Error(`Obfuscation failed: ${error.message}`);
  } finally {
    // Linisin ang temp files
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
  }
}

module.exports = { obfuscateWithPrometheus };
