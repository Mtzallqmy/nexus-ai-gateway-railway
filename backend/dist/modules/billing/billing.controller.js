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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const billing_service_1 = require("./billing.service");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let BillingController = class BillingController {
    billing;
    constructor(billing) {
        this.billing = billing;
    }
    async getPlans(includeInactive) {
        return this.billing.getPlans(includeInactive === "true");
    }
    async createPlan(dto) {
        return this.billing.createPlan(dto);
    }
    async getPlan(id) {
        return this.billing.getPlan(id);
    }
    async updatePlan(id, dto) {
        return this.billing.updatePlan(id, dto);
    }
    async deletePlan(id) {
        return this.billing.deletePlan(id);
    }
    async getSubscriptions(orgId) {
        return this.billing.getSubscriptions(orgId);
    }
    async createSubscription(dto) {
        return this.billing.createSubscription(dto);
    }
    async cancelSubscription(id, cancelAtPeriodEnd = true) {
        return this.billing.cancelSubscription(id, cancelAtPeriodEnd);
    }
    async getUsageLimits(id) {
        return this.billing.getUsageLimits(id);
    }
    async setUsageLimit(id, body) {
        return this.billing.setUsageLimit(id, body.resource, body.limit, body.period);
    }
    async checkQuota(id, body) {
        return this.billing.checkQuota(id, body.resource, body.amount ?? 1);
    }
    async getCredits(orgId, userId) {
        return this.billing.getCredits(orgId, userId);
    }
    async grantCredit(dto) {
        return this.billing.grantCredit(dto);
    }
    async useCredit(id, amount) {
        return this.billing.useCredit(id, amount);
    }
    async getInvoices(orgId, status) {
        return this.billing.getInvoices(orgId, status);
    }
    async createInvoice(dto) {
        return this.billing.createInvoice(dto);
    }
    async getInvoice(id) {
        return this.billing.getInvoice(id);
    }
    async exportInvoice(id) {
        return this.billing.exportInvoice(id);
    }
    async markInvoicePaid(id) {
        return this.billing.markInvoicePaid(id);
    }
    async getPayments(orgId) {
        return this.billing.getPayments(orgId);
    }
    async recordPayment(dto) {
        return this.billing.recordPayment(dto);
    }
    async getCoupons() {
        return this.billing.getCoupons();
    }
    async createCoupon(dto) {
        return this.billing.createCoupon(dto);
    }
    async validateCoupon(code) {
        return this.billing.validateCoupon(code);
    }
    async getBillingHistory(orgId) {
        return this.billing.getBillingHistory(orgId);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)("plans"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Query)("includeInactive")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)("plans"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(billing_service_1.createPlanSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)("plans/:id"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Patch)("plans/:id"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)("plans/:id"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Get)("subscriptions"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Post)("subscriptions"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(billing_service_1.createSubscriptionSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Post)("subscriptions/:id/cancel"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("cancelAtPeriodEnd")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)("subscriptions/:id/limits"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getUsageLimits", null);
__decorate([
    (0, common_1.Post)("subscriptions/:id/limits"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "setUsageLimit", null);
__decorate([
    (0, common_1.Post)("subscriptions/:id/check-quota"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "checkQuota", null);
__decorate([
    (0, common_1.Get)("credits"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __param(1, (0, common_1.Query)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getCredits", null);
__decorate([
    (0, common_1.Post)("credits"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(billing_service_1.grantCreditSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "grantCredit", null);
__decorate([
    (0, common_1.Post)("credits/:id/use"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("amount")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "useCredit", null);
__decorate([
    (0, common_1.Get)("invoices"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __param(1, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Post)("invoices"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(billing_service_1.createInvoiceSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)("invoices/:id"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Get)("invoices/:id/export"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "exportInvoice", null);
__decorate([
    (0, common_1.Post)("invoices/:id/pay"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "markInvoicePaid", null);
__decorate([
    (0, common_1.Get)("payments"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Query)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)("payments"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(billing_service_1.recordPaymentSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)("coupons"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getCoupons", null);
__decorate([
    (0, common_1.Post)("coupons"),
    (0, permissions_decorator_1.RequirePermissions)("billing:write"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(billing_service_1.createCouponSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Post)("coupons/validate"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Body)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "validateCoupon", null);
__decorate([
    (0, common_1.Get)("history/:organizationId"),
    (0, permissions_decorator_1.RequirePermissions)("billing:read"),
    __param(0, (0, common_1.Param)("organizationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getBillingHistory", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)("Billing"),
    (0, common_1.Controller)("billing"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map