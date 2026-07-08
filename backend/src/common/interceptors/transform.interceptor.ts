import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Wraps all successful responses in a consistent { success, data, timestamp } shape.
 * Skips transformation if the response is already in that shape, or if it's a
 * Swagger / file / streaming response.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // Don't wrap undefined/null
        if (data === undefined || data === null) {
          return { success: true, data: null, timestamp: new Date().toISOString() };
        }
        // Already wrapped? Leave alone.
        if (
          typeof data === "object" &&
          "success" in data &&
          "timestamp" in data
        ) {
          return data;
        }
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      })
    );
  }
}
