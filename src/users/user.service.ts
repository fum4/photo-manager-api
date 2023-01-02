import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './user.schema';

const { ObjectId } = Types;

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(name: string, email: string) {
    const user = new this.userModel({ _id: new ObjectId(), name, email });

    await user.save();

    return user;
  }

  async getByEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    if (user) {
      return user;
    }

    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getById(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });

    if (user) {
      return user;
    }

    throw new HttpException(`User with id ${userId} does not exist`, HttpStatus.NOT_FOUND);
  }

  // TODO
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  // TODO
  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userModel.updateOne(
      { _id: userId },
      { currentHashedRefreshToken }
    );
  }
}
