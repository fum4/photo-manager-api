import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection, Model } from 'mongoose';
import { uniqBy } from 'lodash';

import { Image, type ImageDocument, type Tag } from './image.schema';

@Injectable()
export class ImageService {
  images: Image[] = [];

  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  getImages = async (): Promise<Image[]> => {
    return this.imageModel.find().exec();
  };

  addImage = async (payload: Pick<Image, 'name' | 'content' | 'tags'>) => {
    const fileExtension = payload.content.slice(
      payload.content.indexOf('/') + 1,
      payload.content.indexOf(';'),
    );

    const systemTag: Tag = {
      label: fileExtension,
      system: true,
    };

    const deduplicatedTags = uniqBy(
      [ systemTag, ...payload.tags.filter(({ system }) => !system) ],
      'label'
    );

    const image = new this.imageModel({
      name: payload.name,
      content: payload.content,
      tags: deduplicatedTags,
    });

    const { _id, tags, createdAt } = await image.save();

    return { _id, tags, createdAt };
  };

  updateImage = async (_id: string, payload: Partial<Image>) => {
    const { tags, ...rest } = payload;

    const image = await this.imageModel.findById(_id);

    const systemTags = image.tags.filter((tag) => tag.system);
    const updatedTags = tags.filter((tag) => tag?.label && !tag.system);

    await this.imageModel.updateOne(
      { _id },
      {
        $set: {
          tags: uniqBy([ ...systemTags, ...updatedTags ], 'label'),
          ...rest,
        },
      },
    );

    return { _id };
  };

  removeImage = async (_id: string) => {
    await this.imageModel.remove({ _id });

    return { _id };
  };
}
