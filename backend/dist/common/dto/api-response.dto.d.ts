export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
    path?: string;
}
export declare function successResponse<T>(data: T, message?: string): ApiResponse<T>;
export declare function errorResponse(code: string, message: string, details?: unknown, path?: string): ApiResponse<never>;
