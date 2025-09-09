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

  // CORS configurado para desenvolvimento
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowedOrigins = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000,http://192.168.0.25:3000')
    .split(',');

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Em desenvolvimento, permitir qualquer origem local
      if (isDevelopment && (
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('192.168.') ||
        origin.includes('192.168.0.25') ||
        allowedOrigins.includes(origin)
      )) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Desabilitar stack traces em produção
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      const originalSend = res.send;
      res.send = function (data) {
        if (res.statusCode >= 400 && typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            if (parsed.stack) {
              delete parsed.stack;
              data = JSON.stringify(parsed);
            }
          } catch {
            // Ignore parsing errors
          }
        }
        return originalSend.call(this, data);
      };
      next();
    });
  }

  // Prefixo global da API
  app.setGlobalPrefix('api');

  // Configuração do Swagger (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
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
      .addTag('app', 'Endpoints básicos da aplicação')
      .addTag('auth', 'Endpoints de autenticação')
      .addTag('transactions', 'Endpoints de transações')
      .addTag('health', 'Endpoints de saúde da aplicação')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Swagger UI

    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'Stalo API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Documentation: http://localhost:${port}/docs`);
  }
  console.log(`Timezone: ${process.env.TZ}`);
}
void bootstrap();
