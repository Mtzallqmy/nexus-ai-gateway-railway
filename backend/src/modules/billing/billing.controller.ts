import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { BillingService, createCouponSchema, createInvoiceSchema, createPlanSchema, createSubscriptionSchema, grantCreditSchema, recordPaymentSchema, type CreateCouponDto, type CreateInvoiceDto, type CreatePlanDto, type CreateSubscriptionDto, type GrantCreditDto, type RecordPaymentDto } from "./billing.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Billing")
@Controller("billing")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  // PLANS
  @Get("plans")
  @RequirePermissions("billing:read")
  async getPlans(@Query("includeInactive") includeInactive?: string) {
    return this.billing.getPlans(includeInactive === "true");
  }
  @Post("plans")
  @RequirePermissions("billing:write")
  async createPlan(@Body(new ZodValidationPipe(createPlanSchema)) dto: CreatePlanDto) {
    return this.billing.createPlan(dto);
  }
  @Get("plans/:id")
  @RequirePermissions("billing:read")
  async getPlan(@Param("id") id: string) {
    return this.billing.getPlan(id);
  }
  @Patch("plans/:id")
  @RequirePermissions("billing:write")
  async updatePlan(@Param("id") id: string, @Body() dto: Partial<CreatePlanDto>) {
    return this.billing.updatePlan(id, dto);
  }
  @Delete("plans/:id")
  @RequirePermissions("billing:write")
  async deletePlan(@Param("id") id: string) {
    return this.billing.deletePlan(id);
  }

  // SUBSCRIPTIONS
  @Get("subscriptions")
  @RequirePermissions("billing:read")
  async getSubscriptions(@Query("organizationId") orgId?: string) {
    return this.billing.getSubscriptions(orgId);
  }
  @Post("subscriptions")
  @RequirePermissions("billing:write")
  async createSubscription(@Body(new ZodValidationPipe(createSubscriptionSchema)) dto: CreateSubscriptionDto) {
    return this.billing.createSubscription(dto);
  }
  @Post("subscriptions/:id/cancel")
  @RequirePermissions("billing:write")
  async cancelSubscription(@Param("id") id: string, @Body("cancelAtPeriodEnd") cancelAtPeriodEnd = true) {
    return this.billing.cancelSubscription(id, cancelAtPeriodEnd);
  }

  // USAGE LIMITS / QUOTAS
  @Get("subscriptions/:id/limits")
  @RequirePermissions("billing:read")
  async getUsageLimits(@Param("id") id: string) {
    return this.billing.getUsageLimits(id);
  }
  @Post("subscriptions/:id/limits")
  @RequirePermissions("billing:write")
  async setUsageLimit(@Param("id") id: string, @Body() body: { resource: string; limit: number; period?: string }) {
    return this.billing.setUsageLimit(id, body.resource, body.limit, body.period);
  }
  @Post("subscriptions/:id/check-quota")
  @RequirePermissions("billing:read")
  async checkQuota(@Param("id") id: string, @Body() body: { resource: string; amount?: number }) {
    return this.billing.checkQuota(id, body.resource, body.amount ?? 1);
  }

  // CREDITS
  @Get("credits")
  @RequirePermissions("billing:read")
  async getCredits(@Query("organizationId") orgId?: string, @Query("userId") userId?: string) {
    return this.billing.getCredits(orgId, userId);
  }
  @Post("credits")
  @RequirePermissions("billing:write")
  async grantCredit(@Body(new ZodValidationPipe(grantCreditSchema)) dto: GrantCreditDto) {
    return this.billing.grantCredit(dto);
  }
  @Post("credits/:id/use")
  @RequirePermissions("billing:write")
  async useCredit(@Param("id") id: string, @Body("amount") amount: number) {
    return this.billing.useCredit(id, amount);
  }

  // INVOICES
  @Get("invoices")
  @RequirePermissions("billing:read")
  async getInvoices(@Query("organizationId") orgId?: string, @Query("status") status?: string) {
    return this.billing.getInvoices(orgId, status);
  }
  @Post("invoices")
  @RequirePermissions("billing:write")
  async createInvoice(@Body(new ZodValidationPipe(createInvoiceSchema)) dto: CreateInvoiceDto) {
    return this.billing.createInvoice(dto);
  }
  @Get("invoices/:id")
  @RequirePermissions("billing:read")
  async getInvoice(@Param("id") id: string) {
    return this.billing.getInvoice(id);
  }
  @Get("invoices/:id/export")
  @RequirePermissions("billing:read")
  async exportInvoice(@Param("id") id: string) {
    return this.billing.exportInvoice(id);
  }
  @Post("invoices/:id/pay")
  @RequirePermissions("billing:write")
  async markInvoicePaid(@Param("id") id: string) {
    return this.billing.markInvoicePaid(id);
  }

  // PAYMENTS
  @Get("payments")
  @RequirePermissions("billing:read")
  async getPayments(@Query("organizationId") orgId?: string) {
    return this.billing.getPayments(orgId);
  }
  @Post("payments")
  @RequirePermissions("billing:write")
  async recordPayment(@Body(new ZodValidationPipe(recordPaymentSchema)) dto: RecordPaymentDto) {
    return this.billing.recordPayment(dto);
  }

  // COUPONS
  @Get("coupons")
  @RequirePermissions("billing:read")
  async getCoupons() {
    return this.billing.getCoupons();
  }
  @Post("coupons")
  @RequirePermissions("billing:write")
  async createCoupon(@Body(new ZodValidationPipe(createCouponSchema)) dto: CreateCouponDto) {
    return this.billing.createCoupon(dto);
  }
  @Post("coupons/validate")
  @RequirePermissions("billing:read")
  async validateCoupon(@Body("code") code: string) {
    return this.billing.validateCoupon(code);
  }

  // BILLING HISTORY
  @Get("history/:organizationId")
  @RequirePermissions("billing:read")
  async getBillingHistory(@Param("organizationId") orgId: string) {
    return this.billing.getBillingHistory(orgId);
  }
}
