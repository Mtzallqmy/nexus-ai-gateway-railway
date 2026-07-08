import { Test, type TestingModule } from "@nestjs/testing";
import { PermissionsService } from "./permissions.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

const mockPrisma = {
  permission: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  userPermission: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe("PermissionsService", () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a permission", async () => {
      mockPrisma.permission.create.mockResolvedValue({ id: "p1" });
      const result = await service.create({
        name: "Users Read",
        slug: "users:read",
        resource: "users",
        actions: ["read"],
        group: "Users",
        isSystem: false,
      });
      expect(result.id).toBe("p1");
    });
  });

  describe("grouped", () => {
    it("should group permissions by group field", async () => {
      mockPrisma.permission.findMany.mockResolvedValue([
        { id: "p1", group: "Users", name: "Read" },
        { id: "p2", group: "Users", name: "Write" },
        { id: "p3", group: "Billing", name: "Read" },
      ]);
      const result = await service.grouped();
      expect(Object.keys(result)).toEqual(["Users", "Billing"]);
      expect(result["Users"]).toHaveLength(2);
      expect(result["Billing"]).toHaveLength(1);
    });
  });

  describe("grantToUser", () => {
    it("should upsert user permission", async () => {
      mockPrisma.userPermission.upsert.mockResolvedValue({ userId: "u1", permissionId: "p1" });
      await service.grantToUser("u1", "p1", "admin-id");
      expect(mockPrisma.userPermission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_permissionId: { userId: "u1", permissionId: "p1" } },
        })
      );
    });
  });
});
