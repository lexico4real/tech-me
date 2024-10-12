import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from '../config/interceptor/transform.interceptor';
import ClusterConfig from 'config/system/cluster';
import CorsConfig from 'config/system/cors';
import SwaggerConfig from 'config/swagger/config';
import * as compression from 'compression';
import 'dotenv';

async function bootstrap() {
  const cluster = new ClusterConfig();
  const cors = new CorsConfig();
  const doc = new SwaggerConfig();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  await cors.set(app);
  app.setGlobalPrefix('/api/v1');
  await doc.set(app);
  app.use(compression());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableShutdownHooks();
  await cluster.set(app);
}
bootstrap();
