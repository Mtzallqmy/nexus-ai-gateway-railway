import { Test, type TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";

// We mock Prisma + Redis; we test the pure logic of AuthService
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  organization: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  membership: {
    findMany: jest.fn(),
  },
  userPermission: {
    findMany: jest.fn(),
  },
  notification: {
    create: jest.fn().mockResolvedValue({}),
  },
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, unknown> = {
      "app.bcrypt.rounds": 4, // low for tests
      "app.jwt.accessSecret": "test-access-secret-32-chars-min!!!",
      "app.jwt.refreshSecret": "test-refresh-secret-32-chars-min!!",
      "app.jwt.accessExpiresIn": "15m",
      "app.jwt.issuer": "moataz-test",
      "app.jwt.audience": "moataz-test-users",
      "app.twofa.issuer": "Moataz Test",
      "app.twofa.backupCodeCount": 10,
    };
    return map[key];
  }),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue("mock.jwt.token") } },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should throw ConflictException if email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-id" });
      await expect(
        service.register({
          name: "Test User",
          email: "test@example.com",
          password: "Password123",
        })
      ).rejects.toThrow(ConflictException);
    });

    it("should create user and personal org on success", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "new-user-id",
        email: "test@example.com",
        name: "Test User",
      });
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      mockPrisma.organization.create.mockResolvedValue({ id: "org-id" });

      const result = await service.register({
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      });

      expect(result.userId).toBe("new-user-id");
      expect(result.message).toContain("Account created");
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.organization.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("login", () => {
    it("should throw UnauthorizedException if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: "missing@example.com", password: "Password123", rememberMe: false })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      // Use a real bcrypt hash for "CorrectPassword123"
      const bcrypt = await import("bcrypt");
      const hash = await bcrypt.hash("CorrectPassword123", 4);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        email: "test@example.com",
        emailNormalized: "test@example.com",
        passwordHash: hash,
        name: "Test",
        status: "ACTIVE",
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.userPermission.findMany.mockResolvedValue([]);
      mockPrisma.membership.findMany.mockResolvedValue([]);

      await expect(
        service.login({ email: "test@example.com", password: "WrongPassword123", rememberMe: false })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should return success when no token provided", async () => {
      const result = await service.logout(undefined);
      expect(result.message).toBe("Signed out");
    });

    it("should revoke token family when token provided", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({ id: "rt1", familyId: "fam1" });
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.logout("some-refresh-token");
      expect(result.message).toBe("Signed out");
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
    });
  });
});
