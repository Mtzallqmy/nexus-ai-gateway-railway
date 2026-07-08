import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PlaygroundService } from "./playground.service";
import {
  createCollectionSchema,
  createConversationSchema,
  createSavedPromptSchema,
  listConversationsQuerySchema,
  listSavedPromptsQuerySchema,
  sendMessageSchema,
  updateCollectionSchema,
  updateConversationSchema,
  updateSavedPromptSchema,
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
import { addMessageSchema, type AddMessageDto } from "./dto/playground.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Playground")
@Controller("playground")
@UseGuards(JwtAuthGuard)
export class PlaygroundController {
  constructor(private readonly playground: PlaygroundService) {}

  // ============================================================
  // CONVERSATIONS
  // ============================================================
  @Post("conversations")
  @ApiOperation({ summary: "Create a new playground conversation" })
  async createConversation(
    @Body(new ZodValidationPipe(createConversationSchema)) dto: CreateConversationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.createConversation(dto, user.id);
  }

  @Get("conversations")
  @ApiOperation({ summary: "List conversations (paginated, filterable, searchable)" })
  async listConversations(
    @Query(new ZodValidationPipe(listConversationsQuerySchema)) query: ListConversationsQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.findAllConversations(query, user.id);
  }

  @Get("conversations/:id")
  async getConversation(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.findOneConversation(id, user.id);
  }

  @Patch("conversations/:id")
  async updateConversation(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateConversationSchema)) dto: UpdateConversationDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.updateConversation(id, dto, user.id);
  }

  @Delete("conversations/:id")
  async deleteConversation(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.deleteConversation(id, user.id);
  }

  @Post("conversations/:id/pin")
  async pinConversation(@Param("id") id: string, @Body("pinned") pinned: boolean, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.pinConversation(id, pinned, user.id);
  }

  @Get("conversations/:id/export")
  async exportConversation(@Param("id") id: string, @Query("format") format: "json" | "markdown", @CurrentUser() user: AuthenticatedUser) {
    return this.playground.exportConversation(id, user.id, format ?? "json");
  }

  // ============================================================
  // MESSAGES
  // ============================================================
  @Post("conversations/:id/messages")
  async addMessage(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(addMessageSchema)) dto: AddMessageDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.addMessage(id, dto, user.id);
  }

  @Post("conversations/:id/send")
  @ApiOperation({ summary: "Send a message and get AI response (routes through LiteLLM)" })
  async sendMessage(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.sendMessage(id, dto, user);
  }

  // ============================================================
  // SAVED PROMPTS
  // ============================================================
  @Post("prompts")
  async createPrompt(
    @Body(new ZodValidationPipe(createSavedPromptSchema)) dto: CreateSavedPromptDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.createSavedPrompt(dto, user.id);
  }

  @Get("prompts")
  async listPrompts(
    @Query(new ZodValidationPipe(listSavedPromptsQuerySchema)) query: ListSavedPromptsQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.findAllSavedPrompts(query, user.id);
  }

  @Get("prompts/:id")
  async getPrompt(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.findOneSavedPrompt(id, user.id);
  }

  @Patch("prompts/:id")
  async updatePrompt(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateSavedPromptSchema)) dto: UpdateSavedPromptDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.updateSavedPrompt(id, dto, user.id);
  }

  @Delete("prompts/:id")
  async deletePrompt(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.deleteSavedPrompt(id, user.id);
  }

  @Post("prompts/:id/use")
  async usePrompt(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.useSavedPrompt(id, user.id);
  }

  // ============================================================
  // COLLECTIONS
  // ============================================================
  @Post("collections")
  async createCollection(
    @Body(new ZodValidationPipe(createCollectionSchema)) dto: CreateCollectionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.createCollection(dto, user.id);
  }

  @Get("collections")
  async listCollections(@CurrentUser() user: AuthenticatedUser) {
    return this.playground.findAllCollections(user.id);
  }

  @Patch("collections/:id")
  async updateCollection(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCollectionSchema)) dto: UpdateCollectionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.playground.updateCollection(id, dto, user.id);
  }

  @Delete("collections/:id")
  async deleteCollection(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.playground.deleteCollection(id, user.id);
  }

  // ============================================================
  // CODE SAMPLES (Developer Experience)
  // ============================================================
  @Post("code-samples")
  @ApiOperation({ summary: "Generate code samples in 9 languages (cURL, JS, TS, Python, Go, Java, C#, PHP, Rust)" })
  async generateCodeSamples(@Body() body: { model: string; messages: Array<{ role: string; content: string }>; stream: boolean; temperature?: number; max_tokens?: number }) {
    return this.playground.generateCodeSamples(body);
  }
}
