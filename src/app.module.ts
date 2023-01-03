import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as Joi from '@hapi/joi';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './images/image.module';
import { UserModule } from './users/user.module';

const username = 'user';
const password = '6MoYhHG2yd7apakIooww3fdciHDZeCQw';
const mongoUrl = `mongodb+srv://${username}:${password}@cluster0.iob1cqi.mongodb.net/${process.env.NODE_ENV}?retryWrites=true&w=majority`;

@Module({
  imports: [
    AuthModule,
    UserModule,
    ImageModule,
    MongooseModule.forRoot(mongoUrl),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required()
      })
    }),
  ],
  providers: [ JwtService ],
  controllers: [ AppController ],
})

export class AppModule {}
