import { PlaygroundService } from "./playground.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AiService } from "../ai/ai.service";

const mockPrisma = {
  playgroundConversation: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  savedPrompt: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  promptCollection: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockAi = {
  chatCompletion: jest.fn(),
};

describe("PlaygroundService", () => {
  let service: PlaygroundService;

  beforeEach(() => {
    service = new PlaygroundService(
      mockPrisma as never,
      mockAi as unknown as AiService
    );
    jest.clearAllMocks();
  });

  describe("createConversation", () => {
    it("should create a new conversation", async () => {
      mockPrisma.playgroundConversation.create.mockResolvedValue({
        id: "conv-1",
        title: "Test",
        userId: "user-1",
      });

      const result = await service.createConversation(
        { title: "Test", type: "CHAT", parameters: {} },
        "user-1"
      );

      expect(result.id).toBe("conv-1");
      expect(mockPrisma.playgroundConversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            title: "Test",
          }),
        })
      );
    });
  });

  describe("generateCodeSamples", () => {
    it("should generate code in 9 languages", () => {
      const samples = service.generateCodeSamples({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
        stream: false,
      });

      expect(Object.keys(samples)).toHaveLength(9);
      expect(samples).toHaveProperty("curl");
      expect(samples).toHaveProperty("javascript");
      expect(samples).toHaveProperty("typescript");
      expect(samples).toHaveProperty("python");
      expect(samples).toHaveProperty("go");
      expect(samples).toHaveProperty("java");
      expect(samples).toHaveProperty("csharp");
      expect(samples).toHaveProperty("php");
      expect(samples).toHaveProperty("rust");
    });

    it("should include the model name in all samples", () => {
      const samples = service.generateCodeSamples({
        model: "claude-3-5-sonnet",
        messages: [{ role: "user", content: "Hi" }],
        stream: false,
      });

      for (const [, code] of Object.entries(samples)) {
        expect(code).toContain("claude-3-5-sonnet");
      }
    });

    it("should generate streaming code when stream=true", () => {
      const samples = service.generateCodeSamples({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hi" }],
        stream: true,
      });

      expect(samples.javascript).toContain("stream: true");
      expect(samples.python).toContain("stream=True");
    });
  });

  describe("savedPrompts", () => {
    it("should create a saved prompt", async () => {
      mockPrisma.savedPrompt.create.mockResolvedValue({
        id: "prompt-1",
        title: "Test Prompt",
      });

      const result = await service.createSavedPrompt(
        {
          title: "Test Prompt",
          content: "Hello {{name}}",
          isFavorite: false,
          isPublic: false,
          tags: [],
          parameters: {},
        },
        "user-1"
      );

      expect(result.id).toBe("prompt-1");
    });
  });
});
