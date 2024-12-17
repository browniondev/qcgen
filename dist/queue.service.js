"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeGenerationQueue = void 0;
const worker_threads_1 = require("worker_threads");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
class QRCodeGenerationQueue {
    constructor() {
        this.queue = [];
        this.activeWorkers = 0;
        this.maxConcurrentWorkers = 5; // Configurable
        this.jobEmitter = new events_1.EventEmitter();
        this.jobEmitter.on("processQueue", () => this.processNextJob());
    }
    async enqueue(job) {
        return new Promise((resolve, reject) => {
            const queuedJob = {
                ...job,
                id: this.generateUniqueId(),
                resolve,
                reject,
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
        // Create a new worker thread for this job
        const worker = new worker_threads_1.Worker(path_1.default.resolve(__dirname, "qr-generation-worker.js"), {
            workerData: {
                filePath: job.filePath,
                urlTag: job.urlTag,
                nameTag: job.nameTag,
            },
        });
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
    releaseWorker() {
        this.activeWorkers--;
        this.jobEmitter.emit("processQueue");
    }
}
exports.QRCodeGenerationQueue = QRCodeGenerationQueue;
