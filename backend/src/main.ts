import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Configurar timezone
  process.env.TZ = process.env.TZ || 'America/Sao_Paulo';
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Helmet para segurança
  app.use(helmet());
  
  // CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  // Validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Prefixo global da API
  app.setGlobalPrefix('api');
  
  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Stalo API')
    .setDescription('API para sistema de gestão financeira multi-tenant')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('health', 'Endpoints de saúde da aplicação')
    .addTag('seed', 'Endpoints para popular o banco de dados')
    .build();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const document = SwaggerModule.createDocument(app, config);
  
  // Swagger UI
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Stalo API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
  console.log(`Timezone: ${process.env.TZ}`);
}
void bootstrap();
