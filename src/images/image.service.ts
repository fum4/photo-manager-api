import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import { uniqBy } from 'lodash';

import { Image, type ImageDocument, type Tag } from './image.schema';
import { User, type UserDocument } from '../users/user.schema';

const { ObjectId } = Types;

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  findAll = async(userId: string): Promise<Image[]> => {
    const { images } = await this.userModel
      .findOne({ _id: userId }, { images: 1 })
      .sort({ $natural: -1 });

    return images;
  };

  addOne = async(userId: string, payload: Pick<Image, 'name' | 'content' | 'tags'>) => {
    const fileExtension = payload.content.slice(
      payload.content.indexOf('/') + 1,
      payload.content.indexOf(';')
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
      _id: new ObjectId(),
      name: payload.name,
      content: payload.content,
      tags: deduplicatedTags,
    });

    const { _id, tags, createdAt } = await image.save();

    await this.userModel.updateOne(
      { _id: userId },
      { $push: { images: image } }
    );

    return { _id, tags, createdAt };
  };

  updateOne = async(userId: string, assetId: string, payload: Partial<Image>) => {
    const { tags: payloadTags, ...rest } = payload;

    const { images } = await this.userModel.findOne({ _id: userId }, { images: 1 });
    const imageToUpdate = images.find(({ _id }) => _id === assetId);

    const systemTags = imageToUpdate.tags.filter((tag) => tag.isSystemTag);
    const updatedTags = payloadTags.filter((tag) => tag?.label && !tag.isSystemTag);

    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          'images.$[e]': {
            ...imageToUpdate,
            ...rest,
            tags: uniqBy([ ...systemTags, ...updatedTags ], 'label')
          }
        }
      },
      { arrayFilters: [ { 'e._id': assetId } ] }
    );
  };

  deleteOne = async(userId: string, assetId: string) => {
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { images: { _id: assetId } } },
    );
  };
}
