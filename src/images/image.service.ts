import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { uniqBy } from 'lodash';

import { Image, type ImageDocument, type Tag } from './image.schema';

@Injectable()
export class ImageService {
  constructor(@InjectModel(Image.name) private imageModel: Model<ImageDocument>) {}

  images: Image[] = [];

  findAll = async (): Promise<Image[]> => {
    return await this.imageModel.find().sort({ $natural: -1 }).exec();
  };

  addOne = async (payload: Pick<Image, 'name' | 'content' | 'tags'>) => {
    const fileExtension = payload.content.slice(
      payload.content.indexOf('/') + 1,
      payload.content.indexOf(';'),
    );

    const systemTag: Tag = {
      label: fileExtension,
      isSystemTag: true,
    };

    const deduplicatedTags = uniqBy(
      [ systemTag, ...payload.tags.filter(({ isSystemTag }) => !isSystemTag) ],
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

  updateOne = async (_id: string, payload: Partial<Image>) => {
    const { tags, ...rest } = payload;

    const image = await this.imageModel.findById(_id);

    const systemTags = image.tags.filter((tag) => tag.isSystemTag);
    const updatedTags = tags.filter((tag) => tag?.label && !tag.isSystemTag);

    await this.imageModel.updateOne(
      { _id },
      {
        $set: {
          tags: uniqBy(
            [ ...systemTags, ...updatedTags ],
            'label'
          ),
          ...rest,
        },
      },
    );
  };

  deleteOne = async (_id: string) => {
    await this.imageModel.deleteOne({ _id });
  };
}
