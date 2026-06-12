const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const util = require('util');

const execPromise = util.promisify(exec);

// Get the path to the installed @gamely/prometheus-cli package
const getPrometheusCliPath = () => {
  // First, try to find it in the local node_modules folder
  try {
    const localPath = path.join(process.cwd(), 'node_modules', '@gamely', 'prometheus-cli');
    return localPath;
  } catch (error) {
    throw new Error('Could not find @gamely/prometheus-cli package. Make sure it is installed.');
  }
};

async function obfuscateWithPrometheus(inputCode, preset = 'Medium') {
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `input_${Date.now()}.lua`);
  // Use a unique name with .lua extension - Prometheus will output to input.obfuscated.lua
  const outputFileExpected = inputFile + '.obfuscated.lua';

  try {
    // 1. Write the input code
    await fs.writeFile(inputFile, inputCode, 'utf8');

    // 2. Locate the original Prometheus CLI script inside the package
    const cliBasePath = getPrometheusCliPath();
    const originalCliLuaPath = path.join(cliBasePath, 'vendor', 'Prometheus', 'cli.lua');
    // Fallback path in case the structure is different
    const fallbackCliLuaPath = path.join(cliBasePath, 'vendor', 'prometheus-lua', 'Prometheus', 'cli.lua');

    let cliLuaPath;
    try {
      await fs.access(originalCliLuaPath);
      cliLuaPath = originalCliLuaPath;
    } catch (err) {
      try {
        await fs.access(fallbackCliLuaPath);
        cliLuaPath = fallbackCliLuaPath;
      } catch (err2) {
        throw new Error('Could not find the original cli.lua inside the package.');
      }
    }

    // 3. Execute the Lua script directly
    // The command format is: lua cli.lua [--preset PRESET] input_file.lua
    const command = `lua ${cliLuaPath} --preset ${preset} ${inputFile}`;
    console.log('Executing:', command);

    // Use a longer timeout for complex obfuscation
    const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
    
    if (stderr) {
      console.error('CLI stderr:', stderr);
      // stderr may contain the obfuscation progress logs, which are informational.
      // Only throw if it seems like a critical error.
      if (stderr.toLowerCase().includes('error')) {
        throw new Error(stderr);
      }
    }

    // 4. Read the generated output file
    // Prometheus automatically creates the output file by appending '.obfuscated.lua'
    const obfuscatedCode = await fs.readFile(outputFileExpected, 'utf8');
    return obfuscatedCode;

  } catch (error) {
    console.error('Obfuscation error:', error);
    throw new Error(`Obfuscation failed: ${error.message}`);
  } finally {
    // 5. Cleanup temporary files
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFileExpected).catch(() => {});
  }
}

module.exports = { obfuscateWithPrometheus };
