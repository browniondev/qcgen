"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LoggerService = void 0;
const events_1 = require("events");
class LoggerService {
    constructor() {
        this.logs = new Map();
        this.eventEmitter = new events_1.EventEmitter();
    }
    static getInstance() {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }
    createLogEntry(level, message, details) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            details: this.sanitizeDetails(details),
        };
    }
    startJobLog(jobId) {
        this.logs.set(jobId, []);
    }
    info(jobId, message, details) {
        const entry = this.createLogEntry("info", message, details);
        console.log(`[INFO][${jobId}] ${message}`, details || "");
        this.addLogEntry(jobId, entry);
    }
    error(jobId, message, error) {
        const entry = this.createLogEntry("error", message, error);
        console.error(`[ERROR][${jobId}] ${message}`, error || "");
        this.addLogEntry(jobId, entry);
    }
    warn(jobId, message, details) {
        const entry = this.createLogEntry("warn", message, details);
        console.warn(`[WARN][${jobId}] ${message}`, details || "");
        this.addLogEntry(jobId, entry);
    }
    addLogEntry(jobId, entry) {
        if (!this.logs.has(jobId)) {
            this.logs.set(jobId, []);
        }
        this.logs.get(jobId).push(entry);
        this.eventEmitter.emit(`log-${jobId}`, entry);
    }
    getJobLogs(jobId) {
        const logs = this.logs.get(jobId) || [];
        return logs.map((log) => ({
            ...log,
            details: this.sanitizeDetails(log.details),
        }));
    }
    sanitizeDetails(details) {
        if (!details)
            return undefined;
        if (details instanceof Error) {
            return {
                message: details.message,
                name: details.name,
                stack: details.stack,
            };
        }
        try {
            // Try to create a safe copy without circular references
            return JSON.parse(JSON.stringify(details));
        }
        catch {
            // If serialization fails, return a simplified version
            if (typeof details === "object") {
                return "[Complex Object]";
            }
            return String(details);
        }
    }
    clearJobLogs(jobId) {
        this.logs.delete(jobId);
    }
}
exports.LoggerService = LoggerService;
exports.logger = LoggerService.getInstance();
