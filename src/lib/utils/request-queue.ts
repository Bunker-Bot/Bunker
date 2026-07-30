export type RequestPriority = 'critical' | 'high' | 'medium' | 'low';

interface QueueTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  priority: number;
}

/**
 * High-Performance Request Queue Manager
 * Caps concurrent REST API & Supabase RPC requests to maximum 4 active requests.
 * Prevents HTTP request buffer congestion, thread starvation, and socket timeouts.
 */
class PriorityRequestQueue {
  private concurrencyLimit = 2;
  private activeCount = 0;
  private queue: QueueTask<any>[] = [];

  private priorityWeight: Record<RequestPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  public enqueue<T>(fn: () => Promise<T>, priority: RequestPriority = 'medium'): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: QueueTask<T> = {
        fn,
        resolve,
        reject,
        priority: this.priorityWeight[priority],
      };

      this.queue.push(task);
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;

    task.fn()
      .then((res) => task.resolve(res))
      .catch((err) => task.reject(err))
      .finally(() => {
        this.activeCount--;
        this.processQueue();
      });
  }
}

export const requestQueue = new PriorityRequestQueue();
export default requestQueue;
