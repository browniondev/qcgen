"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeGenerationQueue = void 0;
const worker_threads_1 = require("worker_threads");
const events_1 = require("events");
const logger_service_1 = require("./logger.service");
const path_1 = __importDefault(require("path"));
class QRCodeGenerationQueue {
    constructor() {
        this.queue = [];
        this.activeWorkers = 0;
        this.maxConcurrentWorkers = 5; // Configurable
        this.jobEmitter = new events_1.EventEmitter();
        this.jobEmitter.on("processQueue", () => this.processNextJob());
        logger_service_1.logger.info("system", "QR Code Generation Queue initialized", {
            maxConcurrentWorkers: this.maxConcurrentWorkers,
        });
    }
    async enqueue(job) {
        return new Promise((resolve, reject) => {
            const jobId = job.jobId;
            logger_service_1.logger.info(jobId, "Enqueueing new QR generation job");
            const queuedJob = {
                ...job,
                id: this.generateUniqueId(),
                resolve: (result) => {
                    logger_service_1.logger.info(jobId, "Job completed successfully", result);
                    resolve(result);
                },
                reject: (error) => {
                    logger_service_1.logger.error(jobId, "Job failed", error);
                    reject(error);
                },
            };
            this.queue.push(queuedJob);
            this.jobEmitter.emit("processQueue");
        });
    }
    generateUniqueId() {
        return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    processNextJob() {
        // If we've reached max concurrent workers or queue is empty, do nothing
        if (this.activeWorkers >= this.maxConcurrentWorkers ||
            this.queue.length === 0) {
            return;
        }
        // Grab the next job
        const job = this.queue.shift();
        if (!job)
            return;
        this.activeWorkers++;
        logger_service_1.logger.info(job.jobId, "Starting job processing", {
            activeWorkers: this.activeWorkers,
            remainingInQueue: this.queue.length,
        });
        // Create a new worker thread for this job
        try {
            console.log(job.logoPath);
            const worker = new worker_threads_1.Worker(path_1.default.resolve(__dirname, "qr-generation-worker.js"), {
                workerData: {
                    filePath: job.filePath,
                    urlTag: job.urlTag,
                    nameTag: job.nameTag,
                    logoPath: job.logoPath,
                    jobId: job.jobId,
                },
            });
            worker.on("message", (result) => {
                logger_service_1.logger.info(job.jobId, "Worker thread completed", result);
                job.resolve({
                    ...result,
                    logs: logger_service_1.logger.getJobLogs(job.jobId),
                });
                this.releaseWorker(job.jobId);
            });
            worker.on("error", (error) => {
                logger_service_1.logger.error(job.jobId, "Worker thread error", error);
                job.reject({
                    error: "Worker thread error",
                    details: error.message,
                    logs: logger_service_1.logger.getJobLogs(job.jobId),
                });
                this.releaseWorker(job.jobId);
            });
            worker.on("exit", (code) => {
                if (code !== 0) {
                    logger_service_1.logger.error(job.jobId, `Worker stopped with exit code ${code}`);
                    job.reject({
                        error: "Worker thread terminated unexpectedly",
                        exitCode: code,
                        logs: logger_service_1.logger.getJobLogs(job.jobId),
                    });
                }
                this.releaseWorker(job.jobId);
            });
        }
        catch (error) {
            logger_service_1.logger.error(job.jobId, "Failed to create worker thread", error);
            job.reject({
                error: "Failed to create worker thread",
                details: error instanceof Error ? error.message : "Unknown error",
                logs: logger_service_1.logger.getJobLogs(job.jobId),
            });
            this.releaseWorker(job.jobId);
        }
    }
    releaseWorker(jobId) {
        this.activeWorkers--;
        logger_service_1.logger.info(jobId, "Worker released", {
            activeWorkers: this.activeWorkers,
            queueLength: this.queue.length,
        });
        this.jobEmitter.emit("processQueue");
    }
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            activeWorkers: this.activeWorkers,
            maxWorkers: this.maxConcurrentWorkers,
        };
    }
}
exports.QRCodeGenerationQueue = QRCodeGenerationQueue;
