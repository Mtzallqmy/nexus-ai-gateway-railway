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

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(code: string, message: string, details?: unknown, path?: string): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
    path,
  };
}
