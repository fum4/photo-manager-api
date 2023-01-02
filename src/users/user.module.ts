import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [ MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]) ],
  controllers: [],
  providers: [ UserService ],
})
export class UserModule {}
