"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data, message) {
    return {
        success: true,
        data,
        message,
        timestamp: new Date().toISOString(),
    };
}
function errorResponse(code, message, details, path) {
    return {
        success: false,
        error: { code, message, details },
        timestamp: new Date().toISOString(),
        path,
    };
}
//# sourceMappingURL=api-response.dto.js.map