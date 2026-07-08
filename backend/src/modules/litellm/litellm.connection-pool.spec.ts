import { LiteLLMConnectionPool } from "./litellm.connection-pool";

describe("LiteLLMConnectionPool", () => {
  let pool: LiteLLMConnectionPool;

  beforeEach(() => {
    pool = new LiteLLMConnectionPool(3); // max=3
  });

  it("starts with all connections idle", () => {
    const stats = pool.getStats();
    expect(stats.active).toBe(0);
    expect(stats.idle).toBe(3);
    expect(stats.max).toBe(3);
    expect(stats.waiting).toBe(0);
  });

  it("acquires and releases connections", async () => {
    const entry = await pool.acquire();
    expect(pool.getStats().active).toBe(1);

    pool.release(entry);
    expect(pool.getStats().active).toBe(0);
  });

  it("blocks acquire when pool is full", async () => {
    const e1 = await pool.acquire();
    const e2 = await pool.acquire();
    const e3 = await pool.acquire();
    expect(pool.getStats().active).toBe(3);
    expect(pool.getStats().waiting).toBe(0);

    // This acquire should block
    let resolved = false;
    const blockedPromise = pool.acquire().then((entry) => {
      resolved = true;
      return entry;
    });

    // Give event loop a tick
    await new Promise((r) => setTimeout(r, 10));
    expect(resolved).toBe(false);
    expect(pool.getStats().waiting).toBe(1);

    // Release one — should unblock
    pool.release(e1);
    const e4 = await blockedPromise;
    expect(resolved).toBe(true);
    expect(pool.getStats().active).toBe(3);

    // Cleanup
    pool.release(e2);
    pool.release(e3);
    pool.release(e4);
  });

  it("withConnection acquires and releases automatically", async () => {
    const result = await pool.withConnection(async () => {
      expect(pool.getStats().active).toBe(1);
      return "done";
    });

    expect(result).toBe("done");
    expect(pool.getStats().active).toBe(0);
  });

  it("withConnection releases on error", async () => {
    await expect(
      pool.withConnection(async () => {
        throw new Error("test");
      })
    ).rejects.toThrow("test");

    expect(pool.getStats().active).toBe(0);
  });

  it("allows concurrent operations up to max", async () => {
    const ops = Array.from({ length: 3 }).map((_, i) =>
      pool.withConnection(async () => {
        await new Promise((r) => setTimeout(r, 20));
        return i;
      })
    );

    const results = await Promise.all(ops);
    expect(results).toEqual([0, 1, 2]);
    expect(pool.getStats().active).toBe(0);
  });
});
