/**
 * LiteLLM Connection Pool
 *
 * Maintains a pool of reusable HTTP agents to avoid the overhead of
 * creating a new TCP connection for every request to the LiteLLM proxy.
 *
 * Implementation: a simple semaphore-based pool on top of native fetch.
 * Each "acquire" returns a permit; the actual fetch happens in the client.
 * The pool bounds concurrent in-flight requests.
 */
import { Injectable, Logger } from "@nestjs/common";
import { LITELLM_LOG_CONTEXTS } from "./litellm.constants";

interface PoolEntry {
  id: number;
  acquiredAt: number;
}

@Injectable()
export class LiteLLMConnectionPool {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.POOL);
  private readonly max: number;
  private active = 0;
  private idle = 0;
  private waiting = 0;
  private nextId = 1;
  private readonly waiters: Array<(entry: PoolEntry) => void> = [];

  constructor(max = 50) {
    this.max = max;
    this.idle = max;
  }

  async acquire(): Promise<PoolEntry> {
    if (this.active < this.max) {
      this.active++;
      this.idle = this.max - this.active;
      const entry: PoolEntry = { id: this.nextId++, acquiredAt: Date.now() };
      this.logger.debug?.(`Acquired connection #${entry.id} (active=${this.active})`);
      return entry;
    }
    // Wait for a slot
    this.waiting++;
    this.logger.debug?.(`Waiting for connection (waiting=${this.waiting})`);
    return new Promise<PoolEntry>((resolve) => {
      this.waiters.push((entry) => {
        this.waiting--;
        resolve(entry);
      });
    });
  }

  release(entry: PoolEntry): void {
    const duration = Date.now() - entry.acquiredAt;
    this.active--;
    this.idle = this.max - this.active;
    this.logger.debug?.(`Released connection #${entry.id} (held ${duration}ms, active=${this.active})`);

    // Wake up the next waiter
    const next = this.waiters.shift();
    if (next) {
      this.active++;
      this.idle = this.max - this.active;
      next({ id: this.nextId++, acquiredAt: Date.now() });
    }
  }

  getStats(): { active: number; idle: number; max: number; waiting: number } {
    return { active: this.active, idle: this.idle, max: this.max, waiting: this.waiting };
  }

  async withConnection<T>(fn: () => Promise<T>): Promise<T> {
    const entry = await this.acquire();
    try {
      return await fn();
    } finally {
      this.release(entry);
    }
  }
}
