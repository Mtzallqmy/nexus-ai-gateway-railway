import { Test, type TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
};

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe("findOne", () => {
    it("should return user when found", async () => {
      const mockUser = { id: "u1", email: "test@example.com", name: "Test" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findOne("u1");
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne("missing")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should return paginated results", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "u1", email: "a@example.com", name: "A" },
        { id: "u2", email: "b@example.com", name: "B" },
      ]);
      mockPrisma.user.count.mockResolvedValue(2);
      const result = await service.findAll({
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNext).toBe(false);
    });

    it("should apply search filter", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);
      await service.findAll({
        page: 1,
        pageSize: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "test",
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: "test" }) }),
            ]),
          }),
        })
      );
    });
  });

  describe("remove", () => {
    it("should soft-delete user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
      mockPrisma.user.update.mockResolvedValue({});
      const result = await service.remove("u1");
      expect(result.message).toBe("User deleted");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "u1" },
          data: expect.objectContaining({ status: "INACTIVE" }),
        })
      );
    });
  });
});
