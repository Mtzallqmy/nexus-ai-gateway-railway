import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from "@nestjs/common";
import { Observable, throwError, timeout } from "rxjs";
import { catchError } from "rxjs/operators";

/**
 * Aborts any request that takes longer than the configured timeout.
 * Default: 30s. Override per-route via `@Timeout(5000)`.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly DEFAULT_TIMEOUT_MS = 30_000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const configured = request.timeoutMs ?? this.DEFAULT_TIMEOUT_MS;

    return next.handle().pipe(
      timeout(configured),
      catchError((err) => {
        if (err && err.name === "TimeoutError") {
          return throwError(() => new RequestTimeoutException("Request timeout"));
        }
        return throwError(() => err);
      })
    );
  }
}
