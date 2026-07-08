/**
 * Playground Service
 *
 * Manages: conversations, saved prompts, prompt collections, and
 * the playground send-message flow (which routes through the AI service
 * → LiteLLM → AI providers).
 *
 * Also generates multi-language code samples for the developer experience.
 */
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AiService } from "../ai/ai.service";
import {
  type AddMessageDto,
  type CreateCollectionDto,
  type CreateConversationDto,
  type CreateSavedPromptDto,
  type ListConversationsQueryDto,
  type ListSavedPromptsQueryDto,
  type SendMessageDto,
  type UpdateCollectionDto,
  type UpdateConversationDto,
  type UpdateSavedPromptDto,
} from "./dto/playground.dto";
import { buildPagination } from "../../common/dto/pagination.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@Injectable()
export class PlaygroundService {
  private readonly logger = new Logger("PlaygroundService");

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService
  ) {
    this.logger.log("Playground service initialized");
  }

  // ============================================================
  // CONVERSATIONS
  // ============================================================

  async createConversation(dto: CreateConversationDto, userId: string) {
    return this.prisma.playgroundConversation.create({
      data: {
        userId,
        title: dto.title,
        type: dto.type as never,
        providerName: dto.providerName,
        modelName: dto.modelName,
        systemPrompt: dto.systemPrompt,
        parameters: (dto.parameters as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  async findAllConversations(query: ListConversationsQueryDto, userId: string) {
    const where: Prisma.PlaygroundConversationWhereInput = { userId };
    if (query.type) where.type = query.type as never;
    if (query.providerName) where.providerName = query.providerName;
    if (query.modelName) where.modelName = query.modelName;
    if (query.isPinned !== undefined) where.isPinned = query.isPinned;
    if (query.isArchived !== undefined) where.isArchived = query.isArchived;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { systemPrompt: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.playgroundConversation.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.playgroundConversation.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOneConversation(id: string, userId: string) {
    const conv = await this.prisma.playgroundConversation.findFirst({
      where: { id, userId },
    });
    if (!conv) throw new NotFoundException(`Conversation ${id} not found`);
    return conv;
  }

  async updateConversation(id: string, dto: UpdateConversationDto, userId: string) {
    await this.findOneConversation(id, userId);
    return this.prisma.playgroundConversation.update({
      where: { id },
      data: {
        ...dto,
        parameters: dto.parameters ? (dto.parameters as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async deleteConversation(id: string, userId: string) {
    await this.findOneConversation(id, userId);
    await this.prisma.playgroundConversation.delete({ where: { id } });
    return { message: "Conversation deleted" };
  }

  async addMessage(id: string, dto: AddMessageDto, userId: string) {
    const conv = await this.findOneConversation(id, userId);
    const messages = (conv.messages as unknown as unknown[]) ?? [];
    messages.push({
      role: dto.role,
      content: dto.content,
      metadata: dto.metadata,
      timestamp: new Date().toISOString(),
    });
    return this.prisma.playgroundConversation.update({
      where: { id },
      data: {
        messages: messages as Prisma.InputJsonValue,
        messageCount: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });
  }

  /**
   * Send a message in a playground conversation — routes through AI service → LiteLLM.
   */
  async sendMessage(id: string, dto: SendMessageDto, user: AuthenticatedUser) {
    const conv = await this.findOneConversation(id, user.id);

    // Add user message to conversation
    await this.addMessage(id, { role: "user", content: dto.message }, user.id);

    // Build messages array for the AI request
    const conversationMessages = (conv.messages as unknown as Array<{ role: string; content: string }>) ?? [];
    const messages = [
      ...(conv.systemPrompt ? [{ role: "system", content: conv.systemPrompt }] : []),
      ...conversationMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: dto.message },
    ];

    const result = await this.ai.chatCompletion({
      model: conv.modelName ?? "gpt-4o",
      messages: messages as never,
      stream: false,
      ...dto.parameters,
    } as never, user.id);

    // Add assistant response to conversation
    const assistantContent = result.choices?.[0]?.message?.content ?? "";
    await this.addMessage(id, { role: "assistant", content: assistantContent, metadata: { usage: result.usage, cost: result._metadata?.cost } }, user.id);

    // Update conversation token count + cost
    await this.prisma.playgroundConversation.update({
      where: { id },
      data: {
        tokenCount: { increment: result.usage?.total_tokens ?? 0 },
        totalCost: { increment: new Prisma.Decimal(result._metadata?.cost ?? 0) },
      },
    });

    return result;
  }

  async pinConversation(id: string, pinned: boolean, userId: string) {
    await this.findOneConversation(id, userId);
    return this.prisma.playgroundConversation.update({
      where: { id },
      data: { isPinned: pinned },
    });
  }

  async exportConversation(id: string, userId: string, format: "json" | "markdown" = "json") {
    const conv = await this.findOneConversation(id, userId);
    if (format === "markdown") {
      const messages = (conv.messages as unknown as Array<{ role: string; content: string }>) ?? [];
      const md = `# ${conv.title}\n\n` +
        messages.map((m) => `## ${m.role}\n\n${m.content}\n`).join("\n");
      return { format, content: md, filename: `${conv.title}.md` };
    }
    return { format, content: JSON.stringify(conv, null, 2), filename: `${conv.title}.json` };
  }

  // ============================================================
  // SAVED PROMPTS
  // ============================================================

  async createSavedPrompt(dto: CreateSavedPromptDto, userId: string) {
    return this.prisma.savedPrompt.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        content: dto.content,
        systemPrompt: dto.systemPrompt,
        providerName: dto.providerName,
        modelName: dto.modelName,
        parameters: (dto.parameters as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        isFavorite: dto.isFavorite,
        isPublic: dto.isPublic,
        tags: dto.tags,
        collectionId: dto.collectionId,
      },
    });
  }

  async findAllSavedPrompts(query: ListSavedPromptsQueryDto, userId: string) {
    const where: Prisma.SavedPromptWhereInput = {
      OR: [{ userId }, { isPublic: true }],
    };
    if (query.isFavorite !== undefined) where.isFavorite = query.isFavorite;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.collectionId) where.collectionId = query.collectionId;
    if (query.tags) where.tags = { has: query.tags };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.savedPrompt.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.savedPrompt.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findOneSavedPrompt(id: string, userId: string) {
    const prompt = await this.prisma.savedPrompt.findFirst({
      where: { id, OR: [{ userId }, { isPublic: true }] },
    });
    if (!prompt) throw new NotFoundException(`Saved prompt ${id} not found`);
    return prompt;
  }

  async updateSavedPrompt(id: string, dto: UpdateSavedPromptDto, userId: string) {
    await this.findOneSavedPrompt(id, userId);
    return this.prisma.savedPrompt.update({
      where: { id },
      data: {
        ...dto,
        parameters: dto.parameters ? (dto.parameters as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async deleteSavedPrompt(id: string, userId: string) {
    await this.findOneSavedPrompt(id, userId);
    await this.prisma.savedPrompt.delete({ where: { id } });
    return { message: "Prompt deleted" };
  }

  async useSavedPrompt(id: string, userId: string) {
    await this.findOneSavedPrompt(id, userId);
    return this.prisma.savedPrompt.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    });
  }

  // ============================================================
  // COLLECTIONS
  // ============================================================

  async createCollection(dto: CreateCollectionDto, userId: string) {
    return this.prisma.promptCollection.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic,
        color: dto.color,
      },
    });
  }

  async findAllCollections(userId: string) {
    return this.prisma.promptCollection.findMany({
      where: { OR: [{ userId }, { isPublic: true }] },
      orderBy: { updatedAt: "desc" },
    });
  }

  async updateCollection(id: string, dto: UpdateCollectionDto, userId: string) {
    const collection = await this.prisma.promptCollection.findFirst({ where: { id, userId } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    return this.prisma.promptCollection.update({ where: { id }, data: dto });
  }

  async deleteCollection(id: string, userId: string) {
    const collection = await this.prisma.promptCollection.findFirst({ where: { id, userId } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    await this.prisma.promptCollection.delete({ where: { id } });
    return { message: "Collection deleted" };
  }

  // ============================================================
  // CODE SAMPLES (Developer Experience)
  // ============================================================

  generateCodeSamples(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    stream: boolean;
    temperature?: number;
    max_tokens?: number;
  }): Record<string, string> {
    const baseUrl = process.env.APP_URL ?? "http://localhost:3001";
    return {
      curl: this.generateCurl(params, baseUrl),
      javascript: this.generateJavaScript(params, baseUrl),
      typescript: this.generateTypeScript(params, baseUrl),
      python: this.generatePython(params, baseUrl),
      go: this.generateGo(params, baseUrl),
      java: this.generateJava(params, baseUrl),
      csharp: this.generateCSharp(params, baseUrl),
      php: this.generatePhp(params, baseUrl),
      rust: this.generateRust(params, baseUrl),
    };
  }

  private generateCurl(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    const body = {
      model: params.model,
      messages: params.messages,
      stream: params.stream,
      ...(params.temperature !== undefined && { temperature: params.temperature }),
      ...(params.max_tokens !== undefined && { max_tokens: params.max_tokens }),
    };
    return `curl -X POST ${baseUrl}/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${JSON.stringify(body, null, 2)}'`;
  }

  private generateJavaScript(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    if (params.stream) {
      return `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: '${baseUrl}/v1',
});

const stream = await openai.chat.completions.create({
  model: '${params.model}',
  messages: ${JSON.stringify(params.messages, null, 2)},
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}`;
    }
    return `import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: '${baseUrl}/v1',
});

const response = await openai.chat.completions.create({
  model: '${params.model}',
  messages: ${JSON.stringify(params.messages, null, 2)},${params.temperature !== undefined ? `\n  temperature: ${params.temperature},` : ""}${params.max_tokens !== undefined ? `\n  max_tokens: ${params.max_tokens},` : ""}
});

console.log(response.choices[0].message.content);`;
  }

  private generateTypeScript(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    return `import OpenAI from 'openai';

const openai: OpenAI = new OpenAI({
  apiKey: process.env.MOATAZ_API_KEY!,
  baseURL: '${baseUrl}/v1',
});

async function main(): Promise<void> {
  const response = await openai.chat.completions.create({
    model: '${params.model}',
    messages: ${JSON.stringify(params.messages, null, 2)},
    stream: ${params.stream},${params.temperature !== undefined ? `\n    temperature: ${params.temperature},` : ""}${params.max_tokens !== undefined ? `\n    max_tokens: ${params.max_tokens},` : ""}
  });

  console.log(response.choices[0].message.content);
}

main();`;
  }

  private generatePython(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    if (params.stream) {
      return `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${baseUrl}/v1",
)

stream = client.chat.completions.create(
    model="${params.model}",
    messages=${JSON.stringify(params.messages, null, 4)},
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`;
    }
    return `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${baseUrl}/v1",
)

response = client.chat.completions.create(
    model="${params.model}",
    messages=${JSON.stringify(params.messages, null, 4)},${params.temperature !== undefined ? `\n    temperature=${params.temperature},` : ""}${params.max_tokens !== undefined ? `\n    max_tokens=${params.max_tokens},` : ""}
)

print(response.choices[0].message.content)`;
  }

  private generateGo(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    return `package main

import (
    "context"
    "fmt"
    openai "github.com/sashabaranov/go-openai"
)

func main() {
    config := openai.DefaultConfig("YOUR_API_KEY")
    config.BaseURL = "${baseUrl}/v1"
    client := openai.NewClientWithConfig(config)

    resp, err := client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
        Model: "${params.model}",
        Messages: ${JSON.stringify(params.messages, null, 8)},
        Stream: ${params.stream},
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(resp.Choices[0].Message.Content)
}`;
  }

  private generateJava(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    return `import com.openai.client.OpenAI;
import com.openai.models.*;

public class Main {
    public static void main(String[] args) {
        OpenAI client = OpenAI.builder()
            .apiKey("YOUR_API_KEY")
            .baseUrl("${baseUrl}/v1")
            .build();

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
            .model("${params.model}")
            .messages(${JSON.stringify(params.messages, null, 12)})
            .stream(${params.stream})
            .build();

        ChatCompletion response = client.chat().completions().create(params);
        System.out.println(response.choices().get(0).message().content());
    }
}`;
  }

  private generateCSharp(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    return `using OpenAI;
using OpenAI.Chat;

var client = new OpenAIClient(
    new OpenAIAuthentication("YOUR_API_KEY"),
    new OpenAIClientOptions { Endpoint = new Uri("${baseUrl}/v1") }
);

var completion = await client.ChatEndpoint.GetCompletionAsync(new ChatRequest {
    Model = "${params.model}",
    Messages = new[] {
${params.messages.map((m) => `        new ChatMessage("${m.role}", "${m.content}"),`).join("\n")}
    },
    Stream = ${params.stream},
});

Console.WriteLine(completion.Choices[0].Message.Content);`;
  }

  private generatePhp(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    return `<?php
require 'vendor/autoload.php';

use OpenAI;

$client = OpenAI::factory()
    ->withApiKey('YOUR_API_KEY')
    ->withBaseUri('${baseUrl}/v1')
    ->make();

$response = $client->chat()->create([
    'model' => '${params.model}',
    'messages' => ${JSON.stringify(params.messages, null, 4)},
    'stream' => ${params.stream},
]);

echo $response['choices'][0]['message']['content'];`;
  }

  private generateRust(params: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }, baseUrl: string): string {
    return `use async_openai::{Client, config::OpenAIConfig, types::*};

#[tokio::main]
async fn main() {
    let config = OpenAIConfig::new()
        .with_api_key("YOUR_API_KEY")
        .with_api_base("${baseUrl}/v1");
    let client = Client::with_config(config);

    let request = CreateChatCompletionRequestArgs::default()
        .model("${params.model}")
        .messages(${JSON.stringify(params.messages, null, 8)})
        .stream(${params.stream})
        .build()
        .unwrap();

    let response = client.chat().create(request).await.unwrap();
    println!("{}", response.choices[0].message.content);
}`;
  }
}

