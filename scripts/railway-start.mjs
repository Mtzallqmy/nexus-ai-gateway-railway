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
  // Use migrate deploy for production if migrations exist, otherwise db push
  try {
    console.log('🔄 Attempting to push database schema...');
    run('npx', ['prisma', 'db', 'push', '--accept-data-loss']);
  } catch (e) {
    console.error('❌ Database push failed, trying migrate deploy...');
    run('npx', ['prisma', 'migrate', 'deploy']);
  }
  console.log('🌱 Seeding database...');
  run('node', ['prisma/seed.js']);
} else {
  console.error('❌ ERROR: DATABASE_URL is missing or not PostgreSQL.');
  console.error('Moataz AI requires a PostgreSQL database on Railway.');
  process.exit(1);
}

const port = process.env.PORT || '3000';
// Ensure we use 0.0.0.0 for Railway
const env = { 
  ...process.env, 
  HOSTNAME: '0.0.0.0', 
  PORT: port, 
  NODE_ENV: 'production',
  NEXT_PUBLIC_API_URL: process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : ''
};

console.log(`🚀 Starting Moataz AI standalone server on 0.0.0.0:${port}`);
const child = spawn('node', ['.next/standalone/server.js'], { stdio: 'inherit', env });

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Server exited with signal ${signal}`);
    process.exit(0);
  }
  process.exit(code ?? 0);
});
