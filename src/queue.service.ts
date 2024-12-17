import { Worker } from "worker_threads";
import { EventEmitter } from "events";
import path from "path";

interface QRGenerationJob {
  id: string;
  filePath: string;
  urlTag: string;
  nameTag: string;
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class QRCodeGenerationQueue {
  private queue: QRGenerationJob[] = [];
  private activeWorkers: number = 0;
  private maxConcurrentWorkers: number = 5; // Configurable
  private jobEmitter: EventEmitter;

  constructor() {
    this.jobEmitter = new EventEmitter();
    this.jobEmitter.on("processQueue", () => this.processNextJob());
  }

  async enqueue(
    job: Omit<QRGenerationJob, "id" | "resolve" | "reject">
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const queuedJob: QRGenerationJob = {
        ...job,
        id: this.generateUniqueId(),
        resolve,
        reject,
      };

      this.queue.push(queuedJob);
      this.jobEmitter.emit("processQueue");
    });
  }

  private generateUniqueId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private processNextJob() {
    // If we've reached max concurrent workers or queue is empty, do nothing
    if (
      this.activeWorkers >= this.maxConcurrentWorkers ||
      this.queue.length === 0
    ) {
      return;
    }

    // Grab the next job
    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;

    // Create a new worker thread for this job
    const worker = new Worker(
      path.resolve(__dirname, "qr-generation-worker.ts"),
      {
        workerData: {
          filePath: job.filePath,
          urlTag: job.urlTag,
          nameTag: job.nameTag,
        },
      }
    );

    worker.on("message", (result) => {
      job.resolve(result);
      this.releaseWorker();
    });

    worker.on("error", (error) => {
      job.reject(error);
      this.releaseWorker();
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        job.reject(new Error(`Worker stopped with exit code ${code}`));
      }
      this.releaseWorker();
    });
  }

  private releaseWorker() {
    this.activeWorkers--;
    this.jobEmitter.emit("processQueue");
  }
}
  