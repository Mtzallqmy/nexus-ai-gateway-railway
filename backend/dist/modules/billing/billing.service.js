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
exports.BillingService = exports.grantCreditSchema = exports.createCouponSchema = exports.recordPaymentSchema = exports.createInvoiceSchema = exports.createSubscriptionSchema = exports.createPlanSchema = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    slug: zod_1.z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    description: zod_1.z.string().max(2000).optional(),
    price: zod_1.z.number().min(0),
    currency: zod_1.z.string().default("USD"),
    interval: zod_1.z.enum(["MONTHLY", "YEARLY", "LIFETIME"]).default("MONTHLY"),
    trialDays: zod_1.z.number().int().min(0).default(0),
    features: zod_1.z.array(zod_1.z.string()).default([]),
    limits: zod_1.z.record(zod_1.z.unknown()).default({}),
    isPublic: zod_1.z.boolean().default(true),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.createSubscriptionSchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid(),
    planId: zod_1.z.string().uuid(),
    trialDays: zod_1.z.number().int().min(0).optional(),
});
exports.createInvoiceSchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid(),
    subscriptionId: zod_1.z.string().uuid().optional(),
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().default("USD"),
    tax: zod_1.z.number().min(0).default(0),
    discount: zod_1.z.number().min(0).default(0),
    periodStart: zod_1.z.string().datetime(),
    periodEnd: zod_1.z.string().datetime(),
    lineItems: zod_1.z.array(zod_1.z.record(zod_1.z.unknown())).default([]),
    notes: zod_1.z.string().optional(),
});
exports.recordPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid().optional(),
    organizationId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().default("USD"),
    method: zod_1.z.string().default("card"),
    provider: zod_1.z.string().default("stripe"),
    providerPaymentId: zod_1.z.string().optional(),
});
exports.createCouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional(),
    planId: zod_1.z.string().uuid().optional(),
    discountType: zod_1.z.enum(["percentage", "fixed"]).default("percentage"),
    discountValue: zod_1.z.number().min(0),
    maxRedemptions: zod_1.z.number().int().positive().optional(),
    validFrom: zod_1.z.string().datetime(),
    validUntil: zod_1.z.string().datetime().optional(),
});
exports.grantCreditSchema = zod_1.z.object({
    organizationId: zod_1.z.string().uuid().optional(),
    userId: zod_1.z.string().uuid().optional(),
    subscriptionId: zod_1.z.string().uuid().optional(),
    amount: zod_1.z.number().min(0),
    currency: zod_1.z.string().default("USD"),
    type: zod_1.z.string().default("prepaid"),
    expiresAt: zod_1.z.string().datetime().optional(),
});
let BillingService = class BillingService {
    prisma;
    logger = new common_1.Logger("BillingService");
    constructor(prisma) {
        this.prisma = prisma;
        this.logger.log("Billing service initialized");
    }
    async createPlan(dto) {
        return this.prisma.billingPlan.create({
            data: {
                ...dto,
                price: new client_1.Prisma.Decimal(dto.price),
                limits: dto.limits,
            },
        });
    }
    async getPlans(includeInactive = false) {
        return this.prisma.billingPlan.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
        });
    }
    async getPlan(id) {
        const plan = await this.prisma.billingPlan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException(`Plan ${id} not found`);
        return plan;
    }
    async updatePlan(id, dto) {
        await this.getPlan(id);
        const { limits, ...rest } = dto;
        const data = { ...rest };
        if (dto.price !== undefined)
            data.price = new client_1.Prisma.Decimal(dto.price);
        if (limits)
            data.limits = limits;
        return this.prisma.billingPlan.update({ where: { id }, data: data });
    }
    async deletePlan(id) {
        await this.getPlan(id);
        await this.prisma.billingPlan.update({ where: { id }, data: { isActive: false } });
        return { message: "Plan deactivated" };
    }
    async createSubscription(dto) {
        const plan = await this.getPlan(dto.planId);
        const now = new Date();
        const trialEnd = dto.trialDays ? new Date(now.getTime() + dto.trialDays * 24 * 60 * 60 * 1000) : null;
        const periodEnd = new Date(now);
        if (plan.interval === "MONTHLY")
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        else if (plan.interval === "YEARLY")
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else
            periodEnd.setFullYear(periodEnd.getFullYear() + 100);
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
    async getSubscriptions(organizationId) {
        const where = organizationId ? { organizationId } : {};
        return this.prisma.subscription.findMany({
            where,
            include: { plan: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async cancelSubscription(id, cancelAtPeriodEnd = true) {
        const sub = await this.prisma.subscription.findUnique({ where: { id } });
        if (!sub)
            throw new common_1.NotFoundException(`Subscription ${id} not found`);
        return this.prisma.subscription.update({
            where: { id },
            data: {
                cancelAtPeriodEnd,
                canceledAt: cancelAtPeriodEnd ? null : new Date(),
                status: cancelAtPeriodEnd ? sub.status : "CANCELED",
            },
        });
    }
    async getUsageLimits(subscriptionId) {
        return this.prisma.usageLimit.findMany({ where: { subscriptionId } });
    }
    async setUsageLimit(subscriptionId, resource, limit, period = "monthly") {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        return this.prisma.usageLimit.upsert({
            where: { subscriptionId_resource_period: { subscriptionId, resource, period } },
            update: { limit: BigInt(limit), periodStart: now, periodEnd, used: BigInt(0), exceeded: false },
            create: { subscriptionId, resource, limit: BigInt(limit), used: BigInt(0), period, periodStart: now, periodEnd },
        });
    }
    async checkQuota(subscriptionId, resource, amount = 1) {
        const limit = await this.prisma.usageLimit.findUnique({
            where: { subscriptionId_resource_period: { subscriptionId, resource, period: "monthly" } },
        });
        if (!limit)
            return { allowed: true, remaining: -1, limit: -1, used: 0 };
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
    async incrementUsage(subscriptionId, resource, amount) {
        const limit = await this.prisma.usageLimit.findUnique({
            where: { subscriptionId_resource_period: { subscriptionId, resource, period: "monthly" } },
        });
        if (!limit)
            return;
        await this.prisma.usageLimit.update({
            where: { id: limit.id },
            data: { used: { increment: BigInt(amount) } },
        });
    }
    async grantCredit(dto) {
        return this.prisma.credit.create({
            data: {
                ...dto,
                amount: new client_1.Prisma.Decimal(dto.amount),
                balance: new client_1.Prisma.Decimal(dto.amount),
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            },
        });
    }
    async getCredits(organizationId, userId) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        if (userId)
            where.userId = userId;
        return this.prisma.credit.findMany({ where, orderBy: { createdAt: "desc" } });
    }
    async useCredit(id, amount) {
        const credit = await this.prisma.credit.findUnique({ where: { id } });
        if (!credit)
            throw new common_1.NotFoundException(`Credit ${id} not found`);
        const balance = Number(credit.balance);
        if (balance < amount)
            return { success: false, remaining: balance };
        const newBalance = balance - amount;
        await this.prisma.credit.update({
            where: { id },
            data: { balance: new client_1.Prisma.Decimal(newBalance) },
        });
        return { success: true, remaining: newBalance };
    }
    async createInvoice(dto) {
        const total = dto.amount + dto.tax - dto.discount;
        const now = new Date();
        const number = `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`;
        return this.prisma.invoice.create({
            data: {
                number,
                subscriptionId: dto.subscriptionId,
                organizationId: dto.organizationId,
                amount: new client_1.Prisma.Decimal(dto.amount),
                currency: dto.currency,
                tax: new client_1.Prisma.Decimal(dto.tax),
                discount: new client_1.Prisma.Decimal(dto.discount),
                total: new client_1.Prisma.Decimal(total),
                status: "PENDING",
                issueDate: now,
                dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
                periodStart: new Date(dto.periodStart),
                periodEnd: new Date(dto.periodEnd),
                lineItems: dto.lineItems,
                notes: dto.notes,
            },
        });
    }
    async getInvoices(organizationId, status) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        if (status)
            where.status = status;
        return this.prisma.invoice.findMany({
            where,
            include: { payments: true },
            orderBy: { issueDate: "desc" },
        });
    }
    async getInvoice(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { payments: true },
        });
        if (!invoice)
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        return invoice;
    }
    async markInvoicePaid(id) {
        await this.getInvoice(id);
        return this.prisma.invoice.update({
            where: { id },
            data: { status: "PAID", paidDate: new Date() },
        });
    }
    async exportInvoice(id) {
        const invoice = await this.getInvoice(id);
        return {
            number: invoice.number,
            total: invoice.total.toString(),
            status: invoice.status,
            lineItems: invoice.lineItems,
        };
    }
    async recordPayment(dto) {
        const payment = await this.prisma.payment.create({
            data: {
                ...dto,
                amount: new client_1.Prisma.Decimal(dto.amount),
                status: "SUCCEEDED",
                processedAt: new Date(),
            },
        });
        if (dto.invoiceId) {
            await this.markInvoicePaid(dto.invoiceId);
        }
        return payment;
    }
    async getPayments(organizationId) {
        const where = {};
        if (organizationId)
            where.organizationId = organizationId;
        return this.prisma.payment.findMany({ where, orderBy: { createdAt: "desc" } });
    }
    async createCoupon(dto) {
        return this.prisma.coupon.create({
            data: {
                ...dto,
                discountValue: new client_1.Prisma.Decimal(dto.discountValue),
                validFrom: new Date(dto.validFrom),
                validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
            },
        });
    }
    async getCoupons() {
        return this.prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    }
    async validateCoupon(code) {
        const coupon = await this.prisma.coupon.findUnique({ where: { code } });
        if (!coupon)
            return { valid: false };
        if (!coupon.isActive)
            return { valid: false };
        if (coupon.redeemedCount >= (coupon.maxRedemptions ?? Infinity))
            return { valid: false };
        const now = new Date();
        if (now < coupon.validFrom)
            return { valid: false };
        if (coupon.validUntil && now > coupon.validUntil)
            return { valid: false };
        return { valid: true, coupon };
    }
    async redeemCoupon(code) {
        await this.prisma.coupon.update({
            where: { code },
            data: { redeemedCount: { increment: 1 } },
        });
    }
    async getBillingHistory(organizationId) {
        const [invoices, payments, credits] = await Promise.all([
            this.getInvoices(organizationId),
            this.getPayments(organizationId),
            this.getCredits(organizationId),
        ]);
        return { invoices, payments, credits };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map