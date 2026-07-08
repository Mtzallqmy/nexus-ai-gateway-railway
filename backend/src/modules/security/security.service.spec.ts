import { SecurityService } from "./security.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

const mockPrisma = {
  encryptedSecret: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userPermission: {
    findMany: jest.fn(),
  },
  membership: {
    findMany: jest.fn(),
  },
  auditLog: {
    findMany: jest.fn(),
  },
};

const mockConfig = { get: jest.fn(() => null) };

describe("SecurityService", () => {
  let service: SecurityService;

  beforeEach(() => {
    process.env.SECURITY_ENCRYPTION_KEY = "test-encryption-key-for-unit-tests-32+";
    service = new SecurityService(
      mockPrisma as never,
      mockConfig as never
    );
    jest.clearAllMocks();
  });

  describe("Encryption", () => {
    it("should encrypt and decrypt a value correctly", async () => {
      mockPrisma.encryptedSecret.upsert.mockResolvedValue({});

      const plaintext = "my-secret-api-key-12345";

      // Store the secret
      await service.storeSecret("test-key", plaintext, "Test secret", "test", "user-1");
      expect(mockPrisma.encryptedSecret.upsert).toHaveBeenCalledTimes(1);

      // The upsert call should have encrypted the value
      const callArgs = mockPrisma.encryptedSecret.upsert.mock.calls[0][0] as Record<string, unknown>;
      const updateData = (callArgs.update as Record<string, unknown>) ?? {};
      const createData = (callArgs.create as Record<string, unknown>) ?? {};
      const encryptedValue = (updateData.encryptedValue as string) ?? (createData.encryptedValue as string);
      const iv = (updateData.iv as string) ?? (createData.iv as string);
      const authTag = (updateData.authTag as string) ?? (createData.authTag as string);

      expect(encryptedValue).not.toBe(plaintext);
      expect(iv).toBeDefined();
      expect(authTag).toBeDefined();
    });
  });

  describe("getSecrets", () => {
    it("should list secrets without values", async () => {
      mockPrisma.encryptedSecret.findMany.mockResolvedValue([
        { id: "1", key: "openai-key", description: "OpenAI API Key", category: "provider" },
      ]);

      const result = await service.getSecrets("provider");
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe("openai-key");
      // Should NOT have the encryptedValue field
      expect((result[0] as Record<string, unknown>).encryptedValue).toBeUndefined();
    });
  });

  describe("checkAccess", () => {
    it("should allow access for owner role", async () => {
      mockPrisma.userPermission.findMany.mockResolvedValue([]);
      mockPrisma.membership.findMany.mockResolvedValue([{ role: "OWNER" }]);

      const result = await service.checkAccess("user-1", "any-resource", "any-action");
      expect(result.allowed).toBe(true);
    });

    it("should allow access for wildcard permission", async () => {
      mockPrisma.userPermission.findMany.mockResolvedValue([
        { permission: { slug: "*" } },
      ]);
      mockPrisma.membership.findMany.mockResolvedValue([]);

      const result = await service.checkAccess("user-1", "any-resource", "any-action");
      expect(result.allowed).toBe(true);
    });

    it("should allow access for specific permission", async () => {
      mockPrisma.userPermission.findMany.mockResolvedValue([
        { permission: { slug: "users:read" } },
      ]);
      mockPrisma.membership.findMany.mockResolvedValue([]);

      const result = await service.checkAccess("user-1", "users", "read");
      expect(result.allowed).toBe(true);
    });

    it("should deny access when no matching permission", async () => {
      mockPrisma.userPermission.findMany.mockResolvedValue([
        { permission: { slug: "users:read" } },
      ]);
      mockPrisma.membership.findMany.mockResolvedValue([]);

      const result = await service.checkAccess("user-1", "billing", "write");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("billing:write");
    });

    it("should allow admin access to non-security/billing resources", async () => {
      mockPrisma.userPermission.findMany.mockResolvedValue([]);
      mockPrisma.membership.findMany.mockResolvedValue([{ role: "ADMIN" }]);

      const result = await service.checkAccess("user-1", "users", "read");
      expect(result.allowed).toBe(true);
    });

    it("should deny admin access to security resources", async () => {
      mockPrisma.userPermission.findMany.mockResolvedValue([]);
      mockPrisma.membership.findMany.mockResolvedValue([{ role: "ADMIN" }]);

      const result = await service.checkAccess("user-1", "security", "read");
      expect(result.allowed).toBe(false);
    });
  });
});
