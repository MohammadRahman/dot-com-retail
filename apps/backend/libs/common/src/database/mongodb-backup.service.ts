/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// database/mongodb-backup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MongoDBBackupService {
  private readonly logger = new Logger(MongoDBBackupService.name);
  private readonly execAsync = promisify(exec);

  constructor(private configService: ConfigService) {}

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = this.configService.get('BACKUP_DIR') || './backups';
    const backupPath = path.join(backupDir, `mongodb-${timestamp}`);

    try {
      // Ensure backup directory exists
      await fs.mkdir(backupDir, { recursive: true });

      const mongoUri = this.configService.get<string>('MONGODB_URL');

      // Use mongodump for backup
      const command = `mongodump --uri="${mongoUri}" --out="${backupPath}" --gzip`;

      await this.execAsync(command);

      this.logger.log(`Backup created successfully at ${backupPath}`);

      // Compress backup
      const archivePath = `${backupPath}.tar.gz`;
      await this.execAsync(
        `tar -czf ${archivePath} -C ${backupDir} ${path.basename(backupPath)}`,
      );

      // Remove uncompressed backup
      await this.execAsync(`rm -rf ${backupPath}`);

      return archivePath;
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    try {
      const mongoUri = this.configService.get<string>('MONGODB_URL');

      // Extract if compressed
      if (backupPath.endsWith('.tar.gz')) {
        const extractDir = backupPath.replace('.tar.gz', '');
        await this.execAsync(
          `tar -xzf ${backupPath} -C ${path.dirname(backupPath)}`,
        );
        backupPath = extractDir;
      }

      const command = `mongorestore --uri="${mongoUri}" --gzip --drop "${backupPath}"`;

      await this.execAsync(command);

      this.logger.log('Backup restored successfully');
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`);
      throw error;
    }
  }

  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      // Extract and check backup integrity
      const { stdout } = await this.execAsync(
        `tar -tzf ${backupPath} | head -n 5`,
      );

      if (!stdout) {
        throw new Error('Backup archive is empty or corrupted');
      }

      this.logger.log('Backup verification successful');
      return true;
    } catch (error) {
      this.logger.error(`Backup verification failed: ${error.message}`);
      return false;
    }
  }

  async cleanOldBackups(retentionDays: number = 7): Promise<void> {
    const backupDir = this.configService.get('BACKUP_DIR') || './backups';
    const files = await fs.readdir(backupDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    for (const file of files) {
      if (file.startsWith('mongodb-') && file.endsWith('.tar.gz')) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          this.logger.log(`Deleted old backup: ${file}`);
        }
      }
    }
  }
}
