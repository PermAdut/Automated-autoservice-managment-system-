import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (helmet)
  // Install: npm install helmet
  // Uncomment after installing:
  // const helmet = await import('helmet');
  // app.use(helmet.default());

  // Response compression
  // Install: npm install compression @types/compression
  // Uncomment after installing:
  // const compression = await import('compression');
  // app.use(compression.default());

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — restrict to frontend origin in production
  const corsOrigin = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Swagger (disable in production optionally)
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AutoService API')
      .setDescription('AutoService Management System REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Authentication & authorization')
      .addTag('Booking', 'Online appointment booking')
      .addTag('Notifications', 'SMS & email notifications')
      .addTag('Analytics', 'Business analytics & KPIs')
      .addTag('Storage', 'File upload & S3 management')
      .addTag('Tenant', 'White-label configuration')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
