import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (!this.schema) return value;
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.issues
          .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
          .join("; ");
        throw new BadRequestException({
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: err.issues,
          formatted,
        });
      }
      throw err;
    }
  }
}
