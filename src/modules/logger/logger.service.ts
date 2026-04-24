import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'laundry-app-be' },
      transports: [
        new DailyRotateFile({
          filename: path.join('logs', 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
        }),
        new DailyRotateFile({
          filename: path.join('logs', 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  async getLogs(date?: string, level?: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const logsDir = path.join(process.cwd(), 'logs');
    
    try {
      const files = await fs.readdir(logsDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      const logs: string[] = [];
      
      for (const file of logFiles) {
        if (date && !file.includes(date)) continue;
        if (level && !file.includes(level)) continue;
        
        const filePath = path.join(logsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        logs.push('=== ' + file + ' ===\n' + content);
      }
      
      return logs;
    } catch (error) {
      throw new Error('Failed to read logs: ' + error.message);
    }
  }
}
