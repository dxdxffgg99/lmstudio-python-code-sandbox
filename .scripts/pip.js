#!/usr/bin/env node
const { spawnSync } = require('child_process');
const { join } = require('path');
const { existsSync } = require('fs');

function getVenvPython() {
  const root = process.cwd();
  const win = join(root, '.venv', 'Scripts', 'python.exe');
  const unix = join(root, '.venv', 'bin', 'python');
  if (existsSync(win)) return win;
  if (existsSync(unix)) return unix;
  return null;
}

const vpython = getVenvPython();
let pythonCmd = vpython || null;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npm run pip -- <pip-args>\nExamples:\n  npm run pip -- list\n  npm run pip -- install requests\n  npm run pip -- uninstall requests');
  process.exit(1);
}

if (!pythonCmd) {
  const candidates = process.platform === 'win32' ? ['py', 'python'] : ['python3', 'python'];
  for (const c of candidates) {
    try {
      const res = spawnSync(c, ['--version'], { stdio: 'ignore' });
      if (res.status === 0) { pythonCmd = c; break; }
    } catch (e) {
      // ignore
    }
  }
  if (!pythonCmd) {
    console.error('No Python interpreter found. Create the .venv first (npm run venv:create) or install Python.');
    process.exit(2);
  }
}

const pipArgs = ['-m', 'pip', ...args];
const res = spawnSync(pythonCmd, pipArgs, { stdio: 'inherit' });
process.exit(res.status === null ? 1 : res.status);
