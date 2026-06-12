const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);

async function obfuscateWithPrometheus(inputCode, preset = 'Medium') {
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.lua`);
  const outputFile = inputFile + '.obfuscated.lua'; // default output file

  try {
    // Write input code
    await fs.writeFile(inputFile, inputCode, 'utf8');

    // Run command WITHOUT --output (let it use default output file)
    const command = `npx @gamely/prometheus-cli ${inputFile} --preset ${preset}`;
    console.log('Running:', command);

    // Execute, but ignore stdout/stderr (logs are just informational)
    const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
    // Logs are in stderr, but we don't need to show them to user

    // Read the obfuscated code from the output file
    let obfuscatedCode;
    try {
      obfuscatedCode = await fs.readFile(outputFile, 'utf8');
    } catch (err) {
      // If file not found, maybe the CLI wrote elsewhere; fallback to stdout
      if (stdout && stdout.trim()) {
        obfuscatedCode = stdout;
      } else {
        throw new Error('No output file generated and no stdout from CLI');
      }
    }

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
