import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

function run(cmd, args, opts = {}) {
  console.log(`$ ${cmd} ${args.join(" ")}`);

  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    ...opts,
  });

  return res.status === 0;
}

function mustRun(cmd, args, opts = {}) {
  const ok = run(cmd, args, opts);
  if (!ok) {
    console.error(`Command failed: ${cmd} ${args.join(" ")}`);
    process.exit(1);
  }
}

const databaseUrl = process.env.DATABASE_URL || "";

if (!databaseUrl.startsWith("postgres")) {
  console.error("❌ ERROR: DATABASE_URL is missing or not PostgreSQL.");
  console.error("Moataz AI requires Railway PostgreSQL.");
  console.error("Set DATABASE_URL=${{ Postgres.DATABASE_URL }} in Railway Variables.");
  process.exit(1);
}

console.log("🗄️ DATABASE_URL detected. Preparing PostgreSQL schema...");

mustRun("npx", ["prisma", "generate"]);

const hasMigrations = existsSync("prisma/migrations");

if (hasMigrations) {
  console.log("🔄 Applying Prisma migrations...");
  const migrated = run("npx", ["prisma", "migrate", "deploy"]);

  if (!migrated) {
    console.log("⚠️ migrate deploy failed, falling back to prisma db push...");
    mustRun("npx", ["prisma", "db", "push", "--accept-data-loss"]);
  }
} else {
  console.log("🔄 No migrations folder found. Pushing Prisma schema...");
  mustRun("npx", ["prisma", "db", "push", "--accept-data-loss"]);
}

if (existsSync("prisma/seed.js")) {
  console.log("🌱 Seeding database...");
  const seeded = run("node", ["prisma/seed.js"]);

  if (!seeded) {
    console.warn("⚠️ Seed failed, continuing startup.");
  }
} else {
  console.log("ℹ️ No prisma/seed.js found, skipping seed.");
}

const port = process.env.PORT || "3000";

const env = {
  ...process.env,
  HOSTNAME: "0.0.0.0",
  PORT: port,
  NODE_ENV: "production",
};

console.log(`🚀 Starting Moataz AI on 0.0.0.0:${port}`);

const child = spawn("node", [".next/standalone/server.js"], {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.log(`Server exited with signal ${signal}`);
    process.exit(0);
  }

  process.exit(code ?? 0);
});
