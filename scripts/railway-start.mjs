import { spawn, spawnSync } from 'node:child_process';

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (res.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(res.status || 1);
  }
}

const databaseUrl = process.env.DATABASE_URL || '';
if (databaseUrl && databaseUrl.startsWith('postgres')) {
  console.log('🗄️  DATABASE_URL detected. Preparing PostgreSQL schema...');
  run('npx', ['prisma', 'generate']);
  run('npx', ['prisma', 'db', 'push', '--accept-data-loss']);
  run('node', ['prisma/seed.js']);
} else {
  console.warn('⚠️  DATABASE_URL is missing or not PostgreSQL. The UI will start, but database-backed features require Railway Postgres.');
  console.warn('Set DATABASE_URL=${{ Postgres.DATABASE_URL }} in Railway Variables.');
}

const port = process.env.PORT || '3000';
const env = { ...process.env, HOSTNAME: '0.0.0.0', PORT: port, NODE_ENV: 'production' };
console.log(`🚀 Starting Next.js standalone server on 0.0.0.0:${port}`);
const child = spawn('node', ['.next/standalone/server.js'], { stdio: 'inherit', env });
child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Server exited with signal ${signal}`);
    process.exit(0);
  }
  process.exit(code ?? 0);
});
