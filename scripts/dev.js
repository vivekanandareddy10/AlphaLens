import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');

const start = (command, args, cwd, name) => {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n${name} exited with code ${code}`);
    }
  });

  return child;
};

const client = start('npm', ['start'], clientDir, 'Client');
const server = start('npm', ['run', 'dev'], serverDir, 'Server');

const shutdown = () => {
  client.kill('SIGTERM');
  server.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
