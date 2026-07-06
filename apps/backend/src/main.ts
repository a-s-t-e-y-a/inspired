import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ENV } from './config/env.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser middleware
  app.use(cookieParser());

  // Set global routing prefix for all API endpoints
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: [
      'http://localhost:3001', // Admin panel (dev)
      'http://localhost:3000', // Backend Swagger UI
      'http://localhost:4321', // Astro frontend default
      'http://localhost:3002', // Astro frontend fallback
      'https://admin.meditailorhealthcare.com', // Admin panel (prod SSL)
      'http://admin.meditailorhealthcare.com',  // Admin panel (prod)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Setup Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Inspired Bounded Context Auth API')
    .setDescription('Production-grade Patient and Admin JWT authentication engine with dynamic auditing metadata and Refresh Token Rotation (RTR)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(`📡 Connecting NestJS to Mongoose Database...`);
  console.log(`🚀 NestJS Backend running in ${ENV.ENV_NAME.toUpperCase()} mode on port ${ENV.PORT}`);
  console.log(`📄 API Documentation available at http://localhost:${ENV.PORT}/api/docs`);

  await app.listen(ENV.PORT);
}
bootstrap();
