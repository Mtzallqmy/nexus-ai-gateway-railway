import { Test, type TestingModule } from "@nestjs/testing";
import { RolesService } from "./roles.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

const mockPrisma = {
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  permission: {
    findMany: jest.fn(),
  },
  rolePermission: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe("RolesService", () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<RolesService>(RolesService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a role with permissions", async () => {
      mockPrisma.role.create.mockResolvedValue({ id: "r1", name: "QA Engineer" });
      mockPrisma.permission.findMany.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);
      mockPrisma.rolePermission.createMany.mockResolvedValue({ count: 2 });

      const result = await service.create({
        name: "QA Engineer",
        permissionSlugs: ["validation:execute", "logs:read"],
        isDefault: false,
      });

      expect(result.id).toBe("r1");
      expect(mockPrisma.role.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.rolePermission.createMany).toHaveBeenCalledTimes(1);
    });

    it("should work with no permissions", async () => {
      mockPrisma.role.create.mockResolvedValue({ id: "r2", name: "Empty Role" });
      const result = await service.create({
        name: "Empty Role",
        permissionSlugs: [],
        isDefault: false,
      });
      expect(result.id).toBe("r2");
      expect(mockPrisma.rolePermission.createMany).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should throw NotFoundException when role missing", async () => {
      mockPrisma.role.findUnique.mockResolvedValue(null);
      await expect(service.findOne("missing")).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should refuse to delete system roles", async () => {
      mockPrisma.role.findUnique.mockResolvedValue({ id: "r1", isSystem: true });
      await expect(service.remove("r1")).rejects.toThrow("Cannot delete system role");
    });

    it("should soft-delete non-system roles", async () => {
      mockPrisma.role.findUnique.mockResolvedValue({ id: "r1", isSystem: false });
      mockPrisma.role.update.mockResolvedValue({});
      const result = await service.remove("r1");
      expect(result.message).toBe("Role deleted");
    });
  });
});
