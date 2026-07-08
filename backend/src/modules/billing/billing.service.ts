/**
 * Billing Service — Plans, Subscriptions, Usage Limits, Quotas, Credits,
 * Invoices, Payments, Coupons, Discounts, Billing History, Invoice Export.
 */
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  price: z.number().min(0),
  currency: z.string().default("USD"),
  interval: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]).default("MONTHLY"),
  trialDays: z.number().int().min(0).default(0),
  features: z.array(z.string()).default([]),
  limits: z.record(z.unknown()).default({}),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type CreatePlanDto = z.infer<typeof createPlanSchema>;

export const createSubscriptionSchema = z.object({
  organizationId: z.string().uuid(),
  planId: z.string().uuid(),
  trialDays: z.number().int().min(0).optional(),
});
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;

export const createInvoiceSchema = z.object({
  organizationId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  amount: z.number().min(0),
  currency: z.string().default("USD"),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  lineItems: z.array(z.record(z.unknown())).default([]),
  notes: z.string().optional(),
});
export type CreateInvoiceDto = z.infer<typeof createInvoiceSchema>;

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
  amount: z.number().min(0),
  currency: z.string().default("USD"),
  method: z.string().default("card"),
  provider: z.string().default("stripe"),
  providerPaymentId: z.string().optional(),
});
export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  planId: z.string().uuid().optional(),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  discountValue: z.number().min(0),
  maxRedemptions: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional(),
});
export type CreateCouponDto = z.infer<typeof createCouponSchema>;

export const grantCreditSchema = z.object({
  organizationId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  amount: z.number().min(0),
  currency: z.string().default("USD"),
  type: z.string().default("prepaid"),
  expiresAt: z.string().datetime().optional(),
});
export type GrantCreditDto = z.infer<typeof grantCreditSchema>;

@Injectable()
export class BillingService {
  private readonly logger = new Logger("BillingService");

  constructor(private readonly prisma: PrismaService) {
    this.logger.log("Billing service initialized");
  }

  // ============================================================
  // PLANS
  // ============================================================
  async createPlan(dto: CreatePlanDto) {
    return this.prisma.billingPlan.create({
      data: {
        ...dto,
        price: new Prisma.Decimal(dto.price),
        limits: dto.limits as Prisma.InputJsonValue,
      },
    });
  }

  async getPlans(includeInactive = false) {
    return this.prisma.billingPlan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });
  }

  async getPlan(id: string) {
    const plan = await this.prisma.billingPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan ${id} not found`);
    return plan;
  }

  async updatePlan(id: string, dto: Partial<CreatePlanDto>) {
    await this.getPlan(id);
    const { limits, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (limits) data.limits = limits as Prisma.InputJsonValue;
    return this.prisma.billingPlan.update({ where: { id }, data: data as never });
  }

  async deletePlan(id: string) {
    await this.getPlan(id);
    await this.prisma.billingPlan.update({ where: { id }, data: { isActive: false } });
    return { message: "Plan deactivated" };
  }

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================
  async createSubscription(dto: CreateSubscriptionDto) {
    const plan = await this.getPlan(dto.planId);
    const now = new Date();
    const trialEnd = dto.trialDays ? new Date(now.getTime() + dto.trialDays * 24 * 60 * 60 * 1000) : null;
    const periodEnd = new Date(now);
    if (plan.interval === "MONTHLY") periodEnd.setMonth(periodEnd.getMonth() + 1);
    else if (plan.interval === "YEARLY") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setFullYear(periodEnd.getFullYear() + 100); // lifetime

    return this.prisma.subscription.create({
      data: {
        organizationId: dto.organizationId,
        planId: dto.planId,
        status: trialEnd ? "TRIALING" : "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEnd,
      },
    });
  }

  async getSubscriptions(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    return this.prisma.subscription.findMany({
      where,
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async cancelSubscription(id: string, cancelAtPeriodEnd = true) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException(`Subscription ${id} not found`);
    return this.prisma.subscription.update({
      where: { id },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        status: cancelAtPeriodEnd ? sub.status : "CANCELED",
      },
    });
  }

  // ============================================================
  // USAGE LIMITS / QUOTAS
  // ============================================================
  async getUsageLimits(subscriptionId: string) {
    return this.prisma.usageLimit.findMany({ where: { subscriptionId } });
  }

  async setUsageLimit(subscriptionId: string, resource: string, limit: number, period = "monthly") {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    return this.prisma.usageLimit.upsert({
      where: { subscriptionId_resource_period: { subscriptionId, resource, period } },
      update: { limit: BigInt(limit), periodStart: now, periodEnd, used: BigInt(0), exceeded: false },
      create: { subscriptionId, resource, limit: BigInt(limit), used: BigInt(0), period, periodStart: now, periodEnd },
    });
  }

  async checkQuota(subscriptionId: string, resource: string, amount = 1): Promise<{ allowed: boolean; remaining: number; limit: number; used: number }> {
    const limit = await this.prisma.usageLimit.findUnique({
      where: { subscriptionId_resource_period: { subscriptionId, resource, period: "monthly" } },
    });
    if (!limit) return { allowed: true, remaining: -1, limit: -1, used: 0 };
    const used = Number(limit.used);
    const limitNum = Number(limit.limit);
    const allowed = used + amount <= limitNum;
    if (!allowed) {
      await this.prisma.usageLimit.update({
        where: { id: limit.id },
        data: { exceeded: true, exceededAt: new Date() },
      });
    }
    return { allowed, remaining: Math.max(0, limitNum - used), limit: limitNum, used };
  }

  async incrementUsage(subscriptionId: string, resource: string, amount: number): Promise<void> {
    const limit = await this.prisma.usageLimit.findUnique({
      where: { subscriptionId_resource_period: { subscriptionId, resource, period: "monthly" } },
    });
    if (!limit) return;
    await this.prisma.usageLimit.update({
      where: { id: limit.id },
      data: { used: { increment: BigInt(amount) } },
    });
  }

  // ============================================================
  // CREDITS
  // ============================================================
  async grantCredit(dto: GrantCreditDto) {
    return this.prisma.credit.create({
      data: {
        ...dto,
        amount: new Prisma.Decimal(dto.amount),
        balance: new Prisma.Decimal(dto.amount),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async getCredits(organizationId?: string, userId?: string) {
    const where: Prisma.CreditWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    if (userId) where.userId = userId;
    return this.prisma.credit.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async useCredit(id: string, amount: number): Promise<{ success: boolean; remaining: number }> {
    const credit = await this.prisma.credit.findUnique({ where: { id } });
    if (!credit) throw new NotFoundException(`Credit ${id} not found`);
    const balance = Number(credit.balance);
    if (balance < amount) return { success: false, remaining: balance };
    const newBalance = balance - amount;
    await this.prisma.credit.update({
      where: { id },
      data: { balance: new Prisma.Decimal(newBalance) },
    });
    return { success: true, remaining: newBalance };
  }

  // ============================================================
  // INVOICES
  // ============================================================
  async createInvoice(dto: CreateInvoiceDto) {
    const total = dto.amount + dto.tax - dto.discount;
    const now = new Date();
    const number = `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
    return this.prisma.invoice.create({
      data: {
        number,
        subscriptionId: dto.subscriptionId,
        organizationId: dto.organizationId,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency,
        tax: new Prisma.Decimal(dto.tax),
        discount: new Prisma.Decimal(dto.discount),
        total: new Prisma.Decimal(total),
        status: "PENDING",
        issueDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        lineItems: dto.lineItems as Prisma.InputJsonValue,
        notes: dto.notes,
      },
    });
  }

  async getInvoices(organizationId?: string, status?: string) {
    const where: Prisma.InvoiceWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as never;
    return this.prisma.invoice.findMany({
      where,
      include: { payments: true },
      orderBy: { issueDate: "desc" },
    });
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async markInvoicePaid(id: string) {
    await this.getInvoice(id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status: "PAID", paidDate: new Date() },
    });
  }

  async exportInvoice(id: string): Promise<{ number: string; total: string; status: string; lineItems: unknown }> {
    const invoice = await this.getInvoice(id);
    return {
      number: invoice.number,
      total: invoice.total.toString(),
      status: invoice.status,
      lineItems: invoice.lineItems,
    };
  }

  // ============================================================
  // PAYMENTS
  // ============================================================
  async recordPayment(dto: RecordPaymentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        ...dto,
        amount: new Prisma.Decimal(dto.amount),
        status: "SUCCEEDED",
        processedAt: new Date(),
      },
    });
    if (dto.invoiceId) {
      await this.markInvoicePaid(dto.invoiceId);
    }
    return payment;
  }

  async getPayments(organizationId?: string) {
    const where: Prisma.PaymentWhereInput = {};
    if (organizationId) where.organizationId = organizationId;
    return this.prisma.payment.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  // ============================================================
  // COUPONS
  // ============================================================
  async createCoupon(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        ...dto,
        discountValue: new Prisma.Decimal(dto.discountValue),
        validFrom: new Date(dto.validFrom),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
  }

  async getCoupons() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; coupon?: unknown; discountAmount?: number }> {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) return { valid: false };
    if (!coupon.isActive) return { valid: false };
    if (coupon.redeemedCount >= (coupon.maxRedemptions ?? Infinity)) return { valid: false };
    const now = new Date();
    if (now < coupon.validFrom) return { valid: false };
    if (coupon.validUntil && now > coupon.validUntil) return { valid: false };
    return { valid: true, coupon };
  }

  async redeemCoupon(code: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { code },
      data: { redeemedCount: { increment: 1 } },
    });
  }

  // ============================================================
  // BILLING HISTORY
  // ============================================================
  async getBillingHistory(organizationId: string) {
    const [invoices, payments, credits] = await Promise.all([
      this.getInvoices(organizationId),
      this.getPayments(organizationId),
      this.getCredits(organizationId),
    ]);
    return { invoices, payments, credits };
  }
}
