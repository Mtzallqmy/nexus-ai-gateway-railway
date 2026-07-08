import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // PERMISSIONS
  // ============================================================
  const permissions = [
    { name: "Users Read", slug: "users:read", resource: "users", actions: ["read"], group: "Users" },
    { name: "Users Write", slug: "users:write", resource: "users", actions: ["create", "update"], group: "Users" },
    { name: "Users Delete", slug: "users:delete", resource: "users", actions: ["delete"], group: "Users" },
    { name: "Organizations Read", slug: "organizations:read", resource: "organizations", actions: ["read"], group: "Organizations" },
    { name: "Organizations Write", slug: "organizations:write", resource: "organizations", actions: ["create", "update"], group: "Organizations" },
    { name: "Organizations Delete", slug: "organizations:delete", resource: "organizations", actions: ["delete"], group: "Organizations" },
    { name: "Teams Read", slug: "teams:read", resource: "teams", actions: ["read"], group: "Teams" },
    { name: "Teams Write", slug: "teams:write", resource: "teams", actions: ["create", "update"], group: "Teams" },
    { name: "Teams Delete", slug: "teams:delete", resource: "teams", actions: ["delete"], group: "Teams" },
    { name: "Projects Read", slug: "projects:read", resource: "projects", actions: ["read"], group: "Projects" },
    { name: "Projects Write", slug: "projects:write", resource: "projects", actions: ["create", "update"], group: "Projects" },
    { name: "Projects Delete", slug: "projects:delete", resource: "projects", actions: ["delete"], group: "Projects" },
    { name: "Roles Read", slug: "roles:read", resource: "roles", actions: ["read"], group: "Roles" },
    { name: "Roles Write", slug: "roles:write", resource: "roles", actions: ["create", "update"], group: "Roles" },
    { name: "Roles Delete", slug: "roles:delete", resource: "roles", actions: ["delete"], group: "Roles" },
    { name: "Permissions Read", slug: "permissions:read", resource: "permissions", actions: ["read"], group: "Permissions" },
    { name: "Permissions Write", slug: "permissions:write", resource: "permissions", actions: ["create", "update"], group: "Permissions" },
    { name: "API Keys Read", slug: "api-keys:read", resource: "api-keys", actions: ["read"], group: "API Keys" },
    { name: "API Keys Write", slug: "api-keys:write", resource: "api-keys", actions: ["create", "update", "rotate"], group: "API Keys" },
    { name: "API Keys Delete", slug: "api-keys:delete", resource: "api-keys", actions: ["delete"], group: "API Keys" },
    { name: "Audit Read", slug: "audit:read", resource: "audit", actions: ["read"], group: "Audit" },
    { name: "Sessions Read", slug: "sessions:read", resource: "sessions", actions: ["read"], group: "Sessions" },
    { name: "Sessions Write", slug: "sessions:write", resource: "sessions", actions: ["revoke"], group: "Sessions" },
    { name: "Notifications Read", slug: "notifications:read", resource: "notifications", actions: ["read"], group: "Notifications" },
    { name: "Notifications Write", slug: "notifications:write", resource: "notifications", actions: ["create", "update"], group: "Notifications" },
    { name: "Notifications Delete", slug: "notifications:delete", resource: "notifications", actions: ["delete"], group: "Notifications" },
    { name: "Settings Read", slug: "settings:read", resource: "settings", actions: ["read"], group: "Settings" },
    { name: "Settings Write", slug: "settings:write", resource: "settings", actions: ["update"], group: "Settings" },
    { name: "Settings Delete", slug: "settings:delete", resource: "settings", actions: ["delete"], group: "Settings" },
    { name: "Metrics Read", slug: "metrics:read", resource: "metrics", actions: ["read"], group: "Metrics" },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, isSystem: true },
    });
  }
  console.log(`  ✓ ${permissions.length} permissions`);

  // ============================================================
  // ROLES
  // ============================================================
  const allPermSlugs = permissions.map((p) => p.slug);
  const readPermSlugs = permissions.filter((p) => p.slug.endsWith(":read")).map((p) => p.slug);

  const roles = [
    { name: "Owner", slug: "owner", description: "Full access", color: "violet", perms: ["*"] },
    { name: "Admin", slug: "admin", description: "Manage resources", color: "emerald", perms: allPermSlugs.filter((s) => !s.endsWith(":delete") || s === "users:delete") },
    { name: "Developer", slug: "developer", description: "Use playground, view models", color: "cyan", perms: ["projects:read", "api-keys:read", "sessions:read", "notifications:read", "settings:read"] },
    { name: "Viewer", slug: "viewer", description: "Read-only access", color: "muted", perms: readPermSlugs },
    { name: "Billing", slug: "billing", description: "Manage billing", color: "amber", perms: ["settings:read", "settings:write"] },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { slug_organizationId: { slug: r.slug, organizationId: null as never } },
      update: {},
      create: {
        name: r.name,
        slug: r.slug,
        description: r.description,
        color: r.color,
        isSystem: true,
        isDefault: r.slug === "viewer",
        permissions: r.perms,
        organizationId: null,
      },
    } as never);
  }
  console.log(`  ✓ ${roles.length} system roles`);

  // ============================================================
  // ADMIN USER
  // ============================================================
  const passwordHash = await bcrypt.hash("Admin123Password", 12);
  const admin = await prisma.user.upsert({
    where: { emailNormalized: "admin@moataz.ai" },
    update: {},
    create: {
      email: "admin@moataz.ai",
      emailNormalized: "admin@moataz.ai",
      passwordHash,
      name: "Sarah Chen",
      jobTitle: "Owner",
      status: "ACTIVE",
      emailVerified: "VERIFIED",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`  ✓ Admin user (admin@moataz.ai / Admin123Password)`);

  // ============================================================
  // ORGANIZATION
  // ============================================================
  const org = await prisma.organization.upsert({
    where: { slug: "moataz-default" },
    update: {},
    create: {
      name: "Moataz AI Workspace",
      slug: "moataz-default",
      description: "Default organization",
      ownerId: admin.id,
      plan: "scale",
    },
  });
  console.log(`  ✓ Default organization`);

  // ============================================================
  // SETTINGS
  // ============================================================
  await prisma.setting.upsert({
    where: { key: "app.locale" },
    update: {},
    create: { key: "app.locale", value: '"en"', type: "STRING", category: "general", isPublic: true },
  });
  await prisma.setting.upsert({
    where: { key: "app.theme" },
    update: {},
    create: { key: "app.theme", value: '"system"', type: "STRING", category: "appearance", isPublic: true },
  });
  console.log(`  ✓ System settings`);

  // ============================================================
  // SYSTEM CONFIGS
  // ============================================================
  await prisma.systemConfig.upsert({
    where: { key: "maintenance.enabled" },
    update: {},
    create: { key: "maintenance.enabled", value: "false", type: "BOOLEAN", category: "system", isReadOnly: false },
  });
  await prisma.systemConfig.upsert({
    where: { key: "signup.enabled" },
    update: {},
    create: { key: "signup.enabled", value: "true", type: "BOOLEAN", category: "system", isReadOnly: false },
  });
  console.log(`  ✓ System configs`);

  console.log("\n✅ Seeding complete!");
  console.log("\n📋 Demo credentials:");
  console.log("   Email:    admin@moataz.ai");
  console.log("   Password: Admin123Password");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
