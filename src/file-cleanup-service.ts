import fs from "fs";
import path from "path";
import { EventEmitter } from "events";

interface FileRecord {
  filePath: string;
  uploadedAt: number;
}

export class FileCleanupService {
  private files: Map<string, FileRecord> = new Map();
  private cleanupIntervalId: NodeJS.Timeout;
  private readonly RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    // Run cleanup every hour
    this.cleanupIntervalId = setInterval(
      () => this.performCleanup(),
      60 * 60 * 1000
    );
  }

  /**
   * Register a file for future cleanup
   * @param filePath Full path to the uploaded file
   * @returns Unique identifier for the file
   */
  registerFile(filePath: string): string {
    const fileId = this.generateUniqueId();

    this.files.set(fileId, {
      filePath,
      uploadedAt: Date.now(),
    });

    return fileId;
  }

  /**
   * Perform periodic cleanup of old files
   */
  private performCleanup() {
    const now = Date.now();

    this.files.forEach((record, fileId) => {
      if (now - record.uploadedAt > this.RETENTION_PERIOD) {
        try {
          // Check if file exists before attempting to delete
          if (fs.existsSync(record.filePath)) {
            fs.unlinkSync(record.filePath);
            console.log(`Deleted file: ${record.filePath}`);
          }

          // Remove from tracking
          this.files.delete(fileId);
        } catch (error) {
          console.error(`Error deleting file ${record.filePath}:`, error);
        }
      }
    });
  }

  /**
   * Generate a unique identifier for file tracking
   */
  private generateUniqueId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup method to be called when server is shutting down
   */
  shutdown() {
    clearInterval(this.cleanupIntervalId);
  }
}

// Create a singleton instance
export const fileCleanupService = new FileCleanupService();
