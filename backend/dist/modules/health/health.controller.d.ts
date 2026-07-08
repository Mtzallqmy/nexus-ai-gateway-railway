import { HealthService } from "./health.service";
export declare class HealthController {
    private readonly health;
    constructor(health: HealthService);
    liveness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    readiness(): Promise<import("./health.service").HealthCheckResult>;
    check(): Promise<import("./health.service").HealthCheckResult>;
}
