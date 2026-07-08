"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let PlaygroundService = class PlaygroundService {
    prisma;
    ai;
    logger = new common_1.Logger("PlaygroundService");
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
        this.logger.log("Playground service initialized");
    }
    async createConversation(dto, userId) {
        return this.prisma.playgroundConversation.create({
            data: {
                userId,
                title: dto.title,
                type: dto.type,
                providerName: dto.providerName,
                modelName: dto.modelName,
                systemPrompt: dto.systemPrompt,
                parameters: dto.parameters ?? client_1.Prisma.JsonNull,
            },
        });
    }
    async findAllConversations(query, userId) {
        const where = { userId };
        if (query.type)
            where.type = query.type;
        if (query.providerName)
            where.providerName = query.providerName;
        if (query.modelName)
            where.modelName = query.modelName;
        if (query.isPinned !== undefined)
            where.isPinned = query.isPinned;
        if (query.isArchived !== undefined)
            where.isArchived = query.isArchived;
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
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOneConversation(id, userId) {
        const conv = await this.prisma.playgroundConversation.findFirst({
            where: { id, userId },
        });
        if (!conv)
            throw new common_1.NotFoundException(`Conversation ${id} not found`);
        return conv;
    }
    async updateConversation(id, dto, userId) {
        await this.findOneConversation(id, userId);
        return this.prisma.playgroundConversation.update({
            where: { id },
            data: {
                ...dto,
                parameters: dto.parameters ? dto.parameters : undefined,
            },
        });
    }
    async deleteConversation(id, userId) {
        await this.findOneConversation(id, userId);
        await this.prisma.playgroundConversation.delete({ where: { id } });
        return { message: "Conversation deleted" };
    }
    async addMessage(id, dto, userId) {
        const conv = await this.findOneConversation(id, userId);
        const messages = conv.messages ?? [];
        messages.push({
            role: dto.role,
            content: dto.content,
            metadata: dto.metadata,
            timestamp: new Date().toISOString(),
        });
        return this.prisma.playgroundConversation.update({
            where: { id },
            data: {
                messages: messages,
                messageCount: { increment: 1 },
                lastMessageAt: new Date(),
            },
        });
    }
    async sendMessage(id, dto, user) {
        const conv = await this.findOneConversation(id, user.id);
        await this.addMessage(id, { role: "user", content: dto.message }, user.id);
        const conversationMessages = conv.messages ?? [];
        const messages = [
            ...(conv.systemPrompt ? [{ role: "system", content: conv.systemPrompt }] : []),
            ...conversationMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: dto.message },
        ];
        const result = await this.ai.chatCompletion({
            model: conv.modelName ?? "gpt-4o",
            messages: messages,
            stream: false,
            ...dto.parameters,
        }, user.id);
        const assistantContent = result.choices?.[0]?.message?.content ?? "";
        await this.addMessage(id, { role: "assistant", content: assistantContent, metadata: { usage: result.usage, cost: result._metadata?.cost } }, user.id);
        await this.prisma.playgroundConversation.update({
            where: { id },
            data: {
                tokenCount: { increment: result.usage?.total_tokens ?? 0 },
                totalCost: { increment: new client_1.Prisma.Decimal(result._metadata?.cost ?? 0) },
            },
        });
        return result;
    }
    async pinConversation(id, pinned, userId) {
        await this.findOneConversation(id, userId);
        return this.prisma.playgroundConversation.update({
            where: { id },
            data: { isPinned: pinned },
        });
    }
    async exportConversation(id, userId, format = "json") {
        const conv = await this.findOneConversation(id, userId);
        if (format === "markdown") {
            const messages = conv.messages ?? [];
            const md = `# ${conv.title}\n\n` +
                messages.map((m) => `## ${m.role}\n\n${m.content}\n`).join("\n");
            return { format, content: md, filename: `${conv.title}.md` };
        }
        return { format, content: JSON.stringify(conv, null, 2), filename: `${conv.title}.json` };
    }
    async createSavedPrompt(dto, userId) {
        return this.prisma.savedPrompt.create({
            data: {
                userId,
                title: dto.title,
                description: dto.description,
                content: dto.content,
                systemPrompt: dto.systemPrompt,
                providerName: dto.providerName,
                modelName: dto.modelName,
                parameters: dto.parameters ?? client_1.Prisma.JsonNull,
                isFavorite: dto.isFavorite,
                isPublic: dto.isPublic,
                tags: dto.tags,
                collectionId: dto.collectionId,
            },
        });
    }
    async findAllSavedPrompts(query, userId) {
        const where = {
            OR: [{ userId }, { isPublic: true }],
        };
        if (query.isFavorite !== undefined)
            where.isFavorite = query.isFavorite;
        if (query.isPublic !== undefined)
            where.isPublic = query.isPublic;
        if (query.collectionId)
            where.collectionId = query.collectionId;
        if (query.tags)
            where.tags = { has: query.tags };
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
        return (0, pagination_dto_1.buildPagination)(items, total, query);
    }
    async findOneSavedPrompt(id, userId) {
        const prompt = await this.prisma.savedPrompt.findFirst({
            where: { id, OR: [{ userId }, { isPublic: true }] },
        });
        if (!prompt)
            throw new common_1.NotFoundException(`Saved prompt ${id} not found`);
        return prompt;
    }
    async updateSavedPrompt(id, dto, userId) {
        await this.findOneSavedPrompt(id, userId);
        return this.prisma.savedPrompt.update({
            where: { id },
            data: {
                ...dto,
                parameters: dto.parameters ? dto.parameters : undefined,
            },
        });
    }
    async deleteSavedPrompt(id, userId) {
        await this.findOneSavedPrompt(id, userId);
        await this.prisma.savedPrompt.delete({ where: { id } });
        return { message: "Prompt deleted" };
    }
    async useSavedPrompt(id, userId) {
        await this.findOneSavedPrompt(id, userId);
        return this.prisma.savedPrompt.update({
            where: { id },
            data: { useCount: { increment: 1 } },
        });
    }
    async createCollection(dto, userId) {
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
    async findAllCollections(userId) {
        return this.prisma.promptCollection.findMany({
            where: { OR: [{ userId }, { isPublic: true }] },
            orderBy: { updatedAt: "desc" },
        });
    }
    async updateCollection(id, dto, userId) {
        const collection = await this.prisma.promptCollection.findFirst({ where: { id, userId } });
        if (!collection)
            throw new common_1.NotFoundException(`Collection ${id} not found`);
        return this.prisma.promptCollection.update({ where: { id }, data: dto });
    }
    async deleteCollection(id, userId) {
        const collection = await this.prisma.promptCollection.findFirst({ where: { id, userId } });
        if (!collection)
            throw new common_1.NotFoundException(`Collection ${id} not found`);
        await this.prisma.promptCollection.delete({ where: { id } });
        return { message: "Collection deleted" };
    }
    generateCodeSamples(params) {
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
    generateCurl(params, baseUrl) {
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
    generateJavaScript(params, baseUrl) {
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
    generateTypeScript(params, baseUrl) {
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
    generatePython(params, baseUrl) {
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
    generateGo(params, baseUrl) {
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
    generateJava(params, baseUrl) {
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
    generateCSharp(params, baseUrl) {
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
    generatePhp(params, baseUrl) {
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
    generateRust(params, baseUrl) {
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
};
exports.PlaygroundService = PlaygroundService;
exports.PlaygroundService = PlaygroundService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Function])
], PlaygroundService);
//# sourceMappingURL=playground.service.js.map