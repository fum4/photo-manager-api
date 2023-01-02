import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

import { Image } from '../images/image.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  _id: string;

  @Prop()
  name: string;

  @Prop( { unique: true })
  @Prop()
  email: string;

  @Prop()
  password?: string;

  @Prop()
  images?: Image[];

  @Prop()
  currentHashedRefreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
