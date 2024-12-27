import { EventEmitter } from "events";

interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "warn";
  message: string;
  details?: any;
}

export class LoggerService {
  private static instance: LoggerService;
  private logs: Map<string, LogEntry[]> = new Map();
  private eventEmitter: EventEmitter;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private createLogEntry(
    level: LogEntry["level"],
    message: string,
    details?: any
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      details: this.sanitizeDetails(details),
    };
  }

  public startJobLog(jobId: string) {
    this.logs.set(jobId, []);
  }

  public info(jobId: string, message: string, details?: any) {
    const entry = this.createLogEntry("info", message, details);
    console.log(`[INFO][${jobId}] ${message}`, details || "");
    this.addLogEntry(jobId, entry);
  }

  public error(jobId: string, message: string, error?: any) {
    const entry = this.createLogEntry("error", message, error);
    console.error(`[ERROR][${jobId}] ${message}`, error || "");
    this.addLogEntry(jobId, entry);
  }

  public warn(jobId: string, message: string, details?: any) {
    const entry = this.createLogEntry("warn", message, details);
    console.warn(`[WARN][${jobId}] ${message}`, details || "");
    this.addLogEntry(jobId, entry);
  }

  private addLogEntry(jobId: string, entry: LogEntry) {
    if (!this.logs.has(jobId)) {
      this.logs.set(jobId, []);
    }
    this.logs.get(jobId)!.push(entry);
    this.eventEmitter.emit(`log-${jobId}`, entry);
  }

  public getJobLogs(jobId: string): LogEntry[] {
    const logs = this.logs.get(jobId) || [];
    return logs.map((log) => ({
      ...log,
      details: this.sanitizeDetails(log.details),
    }));
  }
  private sanitizeDetails(details: any): any {
    if (!details) return undefined;

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
    } catch {
      // If serialization fails, return a simplified version
      if (typeof details === "object") {
        return "[Complex Object]";
      }
      return String(details);
    }
  }
  public clearJobLogs(jobId: string) {
    this.logs.delete(jobId);
  }
}

export const logger = LoggerService.getInstance();
