import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await this.checkDatabase(),
      },
    };

    const isHealthy = health.services.database.status === 'ok';
    
    return {
      ...health,
      status: isHealthy ? 'ok' : 'error',
    };
  }

  private async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }
}
