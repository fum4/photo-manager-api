import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { Image, ImageSchema } from './image.schema';
import { UserService } from '../users/user.service';
import { User, UserSchema } from '../users/user.schema';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule.forRoot()
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
