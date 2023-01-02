import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as Joi from '@hapi/joi';

import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image, ImageSchema } from './image.schema';
import { User, UserSchema } from '../users/user.schema';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../users/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required()
      })
    })
  ],
  controllers: [ ImageController ],
  providers: [
    ImageService,
    AuthService,
    UserService,
    JwtService
  ],
})
export class ImageModule {}
