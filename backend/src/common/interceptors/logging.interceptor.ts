import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

/**
 * Logs every HTTP request with method, URL, status code, and duration.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get("user-agent") ?? "";
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;
          this.logger.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip} "${userAgent}"`);
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.error(`${method} ${url} ERROR ${duration}ms - ${err?.message ?? err}`);
        },
      })
    );
  }
}
