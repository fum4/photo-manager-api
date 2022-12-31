import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { ImageModule } from './images/image.module';

const username = 'user';
const password = '6MoYhHG2yd7apakIooww3fdciHDZeCQw';
const mongoUrl = `mongodb+srv://${username}:${password}@cluster0.iob1cqi.mongodb.net/${process.env.NODE_ENV}?retryWrites=true&w=majority`;

@Module({
  imports: [ ImageModule, MongooseModule.forRoot(mongoUrl) ],
  controllers: [ AppController ],
})

export class AppModule {}
