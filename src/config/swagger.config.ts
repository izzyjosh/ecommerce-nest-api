import { DocumentBuilder } from '@nestjs/swagger';
import { env } from './env';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('E-commerce API')
  .setDescription('API documentation for the E-commerce application')
  .setVersion('1.0.0')
  .addServer(env.APP_URL)
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
  .addCookieAuth()
  .build();
