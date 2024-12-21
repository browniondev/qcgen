import { Worker } from "worker_threads";
import { EventEmitter } from "events";
import { logger } from "./logger-service";
import path from "path";

interface QRGenerationJob {
  id: string;
  filePath: string;
  urlTag: string;
  nameTag: string;
  logoPath?: string;
  jobId: string;
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
    logger.info("system", "QR Code Generation Queue initialized", {
      maxConcurrentWorkers: this.maxConcurrentWorkers,
    });
  }

  async enqueue(
    job: Omit<QRGenerationJob, "id" | "resolve" | "reject">
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const jobId = job.jobId;
      logger.info(jobId, "Enqueueing new QR generation job");

      const queuedJob: QRGenerationJob = {
        ...job,
        id: this.generateUniqueId(),
        resolve: (result: any) => {
          logger.info(jobId, "Job completed successfully", result);
          resolve(result);
        },
        reject: (error: any) => {
          logger.error(jobId, "Job failed", error);
          reject(error);
        },
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
    logger.info(job.jobId, "Starting job processing", {
      activeWorkers: this.activeWorkers,
      remainingInQueue: this.queue.length,
    });

    // Create a new worker thread for this job
    try {
      console.log(job.logoPath);
      const worker = new Worker(
        path.resolve(__dirname, "qr-generation-worker.js"),
        {
          workerData: {
            filePath: job.filePath,
            urlTag: job.urlTag,
            nameTag: job.nameTag,
            logoPath: job.logoPath,
            jobId: job.jobId,
          },
        }
      );

      // worker.on("message", (result) => {
      //   job.resolve(result);
      //   this.releaseWorker();
      // });

      worker.on("message", (result) => {
        logger.info(job.jobId, "Worker thread completed", result);
        job.resolve({
          ...result,
          logs: logger.getJobLogs(job.jobId),
        });
        this.releaseWorker(job.jobId);
      });

      // worker.on("error", (error) => {
      //   job.reject(error);
      //   this.releaseWorker();
      // });

      worker.on("error", (error) => {
        logger.error(job.jobId, "Worker thread error", error);
        job.reject({
          error: "Worker thread error",
          details: error.message,
          logs: logger.getJobLogs(job.jobId),
        });
        this.releaseWorker(job.jobId);
      });

      // worker.on("exit", (code) => {
      //   if (code !== 0) {
      //     job.reject(new Error(`Worker stopped with exit code ${code}`));
      //   }
      //   this.releaseWorker();
      // });

      worker.on("exit", (code) => {
        if (code !== 0) {
          logger.error(job.jobId, `Worker stopped with exit code ${code}`);
          job.reject({
            error: "Worker thread terminated unexpectedly",
            exitCode: code,
            logs: logger.getJobLogs(job.jobId),
          });
        }
        this.releaseWorker(job.jobId);
      });
    } catch (error) {
      logger.error(job.jobId, "Failed to create worker thread", error);
      job.reject({
        error: "Failed to create worker thread",
        details: error instanceof Error ? error.message : "Unknown error",
        logs: logger.getJobLogs(job.jobId),
      });
      this.releaseWorker(job.jobId);
    }
  }

  private releaseWorker(jobId: string) {
    this.activeWorkers--;
    logger.info(jobId, "Worker released", {
      activeWorkers: this.activeWorkers,
      queueLength: this.queue.length,
    });
    this.jobEmitter.emit("processQueue");
  }
  public getQueueStatus(): any {
    return {
      queueLength: this.queue.length,
      activeWorkers: this.activeWorkers,
      maxWorkers: this.maxConcurrentWorkers,
    };
  }
}
