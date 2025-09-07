import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function runSeed() {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seed command can only be run in development mode');
    process.exit(1);
  }

  console.log('🚀 Starting seed runner...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed();