import { spawn } from 'node:child_process';

const processes = [
  spawn('npx', ['tsx', 'watch', 'backend/src/server.ts'], { stdio: 'inherit', shell: true }),
  spawn('npx', ['vite', '--config', 'frontend/vite.config.ts'], { stdio: 'inherit', shell: true })
];

function stop() {
  processes.forEach((process) => process.kill());
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
