/**
 * Unified AI Controller — OpenAI-compatible endpoints.
 *
 * Any client using the OpenAI SDK can point at this API and it will work
 * without code changes. All requests are routed through LiteLLM.
 *
 * OpenAI SDK configuration:
 *   const openai = new OpenAI({
 *     apiKey: '<your-moataz-api-key>',
 *     baseURL: 'http://localhost:3001/v1'
 *   });
 */
import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AiService } from "./ai.service";
import {
  chatCompletionSchema,
  embeddingsSchema,
  imageGenerationSchema,
  moderationSchema,
  textToSpeechSchema,
  type ChatCompletionDto,
  type EmbeddingsDto,
  type ImageGenerationDto,
  type ModerationDto,
  type TextToSpeechDto,
} from "./dto/ai.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("AI API")
@Controller("v1")
export class AiController {
  constructor(private readonly ai: AiService) {}

  // ============================================================
  // CHAT COMPLETIONS (OpenAI-compatible)
  // ============================================================
  @Post("chat/completions")
  @ApiOperation({ summary: "Create a chat completion (OpenAI-compatible, supports streaming)" })
  async chatCompletions(
    @Body(new ZodValidationPipe(chatCompletionSchema)) dto: ChatCompletionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response
  ) {
    if (dto.stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      try {
        for await (const chunk of this.ai.chatCompletionStream(dto, user?.id)) {
          res.write(chunk);
        }
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: { message: (err as Error).message } })}\n\n`);
        res.write("data: [DONE]\n\n");
      } finally {
        res.end();
      }
      return;
    }

    const result = await this.ai.chatCompletion(dto, user?.id);
    return result;
  }

  // ============================================================
  // COMPLETIONS (legacy OpenAI-compatible)
  // ============================================================
  @Post("completions")
  @ApiOperation({ summary: "Create a legacy text completion (OpenAI-compatible)" })
  async completions(
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser
  ) {
    // Convert legacy completion to chat format
    const { model, prompt, ...params } = body as { model: string; prompt: string; [k: string]: unknown };
    return this.ai.chatCompletion(
      {
        model,
        messages: [{ role: "user", content: prompt }],
        ...params,
      } as ChatCompletionDto,
      user?.id
    );
  }

  // ============================================================
  // EMBEDDINGS (OpenAI-compatible)
  // ============================================================
  @Post("embeddings")
  @ApiOperation({ summary: "Create embeddings (OpenAI-compatible)" })
  async embeddings(
    @Body(new ZodValidationPipe(embeddingsSchema)) dto: EmbeddingsDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ai.embeddings(dto, user?.id);
  }

  // ============================================================
  // IMAGES (OpenAI-compatible)
  // ============================================================
  @Post("images/generations")
  @ApiOperation({ summary: "Generate images (OpenAI-compatible)" })
  async imageGenerations(
    @Body(new ZodValidationPipe(imageGenerationSchema)) dto: ImageGenerationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ai.generateImages(dto, user?.id);
  }

  // ============================================================
  // AUDIO (OpenAI-compatible)
  // ============================================================
  @Post("audio/speech")
  @ApiOperation({ summary: "Generate speech from text (OpenAI-compatible TTS)" })
  async textToSpeech(
    @Body(new ZodValidationPipe(textToSpeechSchema)) dto: TextToSpeechDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response
  ) {
    const audioBuffer = await this.ai.textToSpeech(dto, user?.id);
    res.setHeader("Content-Type", `audio/${dto.response_format}`);
    res.setHeader("Content-Disposition", `attachment; filename="speech.${dto.response_format}"`);
    return res.send(audioBuffer);
  }

  // ============================================================
  // MODERATION (OpenAI-compatible)
  // ============================================================
  @Post("moderations")
  @ApiOperation({ summary: "Moderate content (OpenAI-compatible)" })
  async moderations(
    @Body(new ZodValidationPipe(moderationSchema)) dto: ModerationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.ai.moderation(dto, user?.id);
  }

  // ============================================================
  // MODELS (OpenAI-compatible)
  // ============================================================
  @Get("models")
  @ApiOperation({ summary: "List all available models (OpenAI-compatible)" })
  async listModels() {
    return this.ai.listModels();
  }

  @Get("models/:id")
  @ApiOperation({ summary: "Get a specific model (OpenAI-compatible)" })
  async getModel() {
    // OpenAI returns a single model object
    return { object: "model", owned_by: "system" };
  }
}
