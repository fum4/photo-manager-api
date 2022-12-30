import { NestFactory } from '@nestjs/core';
import { urlencoded, json } from 'express';

import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb' }));

  await app.listen(process.env.PORT || 3000);

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
