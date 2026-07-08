import { Body, Controller, Get, Param, Post, Patch, Delete, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProvidersService } from "./providers.service";
import {
  discoverProviderSchema,
  listProvidersQuerySchema,
  providerAnalyticsQuerySchema,
  providerLogsQuerySchema,
  validateApiKeySchema,
  type DiscoverProviderDto,
  type ListProvidersQueryDto,
  type ProviderAnalyticsQueryDto,
  type ProviderLogsQueryDto,
  type ValidateApiKeyDto,
  createProviderSchema,
  updateProviderSchema,
  testConnectionSchema,
  type CreateProviderDto,
  type UpdateProviderDto,
} from "./dto/provider.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Providers")
@Controller("providers")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  // ============================================================
  // REGISTRY
  // ============================================================
  @Get()
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "List all providers in the registry (paginated, filterable, searchable)" })
  async findAll(@Query(new ZodValidationPipe(listProvidersQuerySchema)) query: ListProvidersQueryDto) {
    return this.providers.findAll(query);
  }

  @Get("catalog")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get the static provider catalog (all 20+ supported providers)" })
  async getCatalog() {
    return this.providers.getCatalog();
  }

  @Get(":slug")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get a single provider by slug" })
  async findBySlug(@Param("slug") slug: string) {
    return this.providers.findBySlug(slug);
  }

  // ============================================================
  // API KEY VALIDATION
  // ============================================================
  @Post("validate-key")
  @RequirePermissions("providers:write")
  @ApiOperation({ summary: "Validate an API key via REAL request through LiteLLM (never faked)" })
  async validateApiKey(@Body(new ZodValidationPipe(validateApiKeySchema)) dto: ValidateApiKeyDto) {
    return this.providers.validateApiKey(dto);
  }

  @Get("validation-history/:providerName?")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get API key validation history" })
  async validationHistory(@Param("providerName") providerName?: string, @Query("limit") limit?: string) {
    return this.providers.getValidationHistory(providerName, limit ? parseInt(limit) : 20);
  }

  // ============================================================
  // DISCOVERY
  // ============================================================
  @Post("discover")
  @RequirePermissions("providers:write")
  @ApiOperation({ summary: "Discover provider capabilities via REAL requests (auto-detect models, vision, audio, etc.)" })
  async discover(@Body(new ZodValidationPipe(discoverProviderSchema)) dto: DiscoverProviderDto) {
    return this.providers.discoverProvider(dto);
  }

  @Get("discovery/results")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get discovery results for all providers" })
  async discoveryResults() {
    return this.providers.getAllDiscoveryResults();
  }

  @Get("discovery/:providerName")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get discovery result for a specific provider" })
  async discoveryResult(@Param("providerName") providerName: string) {
    return this.providers.getDiscoveryResult(providerName);
  }

  // ============================================================
  // HEALTH
  // ============================================================
  @Get("health/:providerName?")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get provider health status" })
  async health(@Param("providerName") providerName?: string) {
    return this.providers.getProviderHealth(providerName);
  }

  @Post("health-check")
  @RequirePermissions("providers:write")
  @ApiOperation({ summary: "Run a health check (triggered manually)" })
  async runHealthCheck(@Body("providerName") providerName?: string) {
    return this.providers.runHealthCheck(providerName);
  }

  // ============================================================
  // STATISTICS
  // ============================================================
  @Get("statistics/:providerName?")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get provider statistics (requests, errors, tokens, cost, latency)" })
  async statistics(@Param("providerName") providerName?: string) {
    return this.providers.getStatistics(providerName);
  }

  // ============================================================
  // ANALYTICS
  // ============================================================
  @Get("analytics")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get provider analytics (timeline + per-provider breakdown)" })
  async analytics(@Query(new ZodValidationPipe(providerAnalyticsQuerySchema)) query: ProviderAnalyticsQueryDto) {
    return this.providers.getAnalytics(query);
  }

  // ============================================================
  // LOGS
  // ============================================================
  @Get("logs")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get provider logs (paginated, filterable, sortable)" })
  async logs(@Query(new ZodValidationPipe(providerLogsQuerySchema)) query: ProviderLogsQueryDto) {
    return this.providers.getLogs(query);
  }

  // ============================================================
  // DASHBOARD
  // ============================================================
  @Get("dashboard/overview")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Get provider dashboard overview (summary + recent validations + recent logs)" })
  async dashboard() {
    return this.providers.getDashboard();
  }

  // ============================================================
  // DYNAMIC PROVIDER MANAGEMENT
  // ============================================================

  @Post()
  @RequirePermissions("providers:write")
  @ApiOperation({ summary: "Create a new provider" })
  async createProvider(
    @Body(new ZodValidationPipe(createProviderSchema)) dto: CreateProviderDto
  ) {
    return this.providers.createProvider(dto);
  }

  @Patch(":id")
  @RequirePermissions("providers:write")
  @ApiOperation({ summary: "Update an existing provider" })
  async updateProvider(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateProviderSchema)) dto: UpdateProviderDto
  ) {
    return this.providers.updateProvider(id, dto);
  }

  @Delete(":id")
  @RequirePermissions("providers:write")
  @ApiOperation({ summary: "Delete a provider" })
  async deleteProvider(@Param("id") id: string) {
    return this.providers.deleteProvider(id);
  }

  @Post(":id/test-connection")
  @RequirePermissions("providers:read")
  @ApiOperation({ summary: "Test connectivity to a provider" })
  async testConnection(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(testConnectionSchema)) _body: unknown
  ) {
    return this.providers.testConnection(id);
  }
}
