import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { ImageModule } from './images/image.module';

const username = 'fum4';
const password = '1b2duj35';
const project = 'nestjs-images';
const mongoUrl = `mongodb+srv://${username}:${password}@cluster0.iob1cqi.mongodb.net/${project}?retryWrites=true&w=majority`;

@Module({
  imports: [ ImageModule, MongooseModule.forRoot(mongoUrl) ],
  controllers: [ AppController ],
})

export class AppModule {}
