"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileCleanupService = exports.FileCleanupService = void 0;
const fs_1 = __importDefault(require("fs"));
class FileCleanupService {
    constructor() {
        this.files = new Map();
        this.RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        // Run cleanup every hour
        this.cleanupIntervalId = setInterval(() => this.performCleanup(), 60 * 60 * 1000);
    }
    /**
     * Register a file for future cleanup
     * @param filePath Full path to the uploaded file
     * @returns Unique identifier for the file
     */
    registerFile(filePath) {
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
    performCleanup() {
        const now = Date.now();
        this.files.forEach((record, fileId) => {
            if (now - record.uploadedAt > this.RETENTION_PERIOD) {
                try {
                    // Check if file exists before attempting to delete
                    if (fs_1.default.existsSync(record.filePath)) {
                        fs_1.default.unlinkSync(record.filePath);
                        console.log(`Deleted file: ${record.filePath}`);
                    }
                    // Remove from tracking
                    this.files.delete(fileId);
                }
                catch (error) {
                    console.error(`Error deleting file ${record.filePath}:`, error);
                }
            }
        });
    }
    /**
     * Generate a unique identifier for file tracking
     */
    generateUniqueId() {
        return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Cleanup method to be called when server is shutting down
     */
    shutdown() {
        clearInterval(this.cleanupIntervalId);
    }
}
exports.FileCleanupService = FileCleanupService;
// Create a singleton instance
exports.fileCleanupService = new FileCleanupService();
