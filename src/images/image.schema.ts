import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

export interface Tag {
  label: string;
  isSystemTag?: boolean;
}

export type ImageDocument = HydratedDocument<Image>;

@Schema({ timestamps: true })
export class Image {
  @Prop()
  name: string;

  @Prop()
  content: string;

  @Prop()
  tags: Tag[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
