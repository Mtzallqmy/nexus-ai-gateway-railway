interface PoolEntry {
    id: number;
    acquiredAt: number;
}
export declare class LiteLLMConnectionPool {
    private readonly logger;
    private readonly max;
    private active;
    private idle;
    private waiting;
    private nextId;
    private readonly waiters;
    constructor(max?: number);
    acquire(): Promise<PoolEntry>;
    release(entry: PoolEntry): void;
    getStats(): {
        active: number;
        idle: number;
        max: number;
        waiting: number;
    };
    withConnection<T>(fn: () => Promise<T>): Promise<T>;
}
export {};
