import { Get, Post, Put, Delete, Param, Body, Controller } from '@nestjs/common';

import { AuthService } from '../auth/auth.service';
import { ImageService } from './image.service';
import { Image } from './image.schema';

@Controller('images')
export class ImageController {
  constructor(
    private readonly authService: AuthService,
    private readonly imageService: ImageService
  ) {}

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.imageService.findAll(userId);
  }

  @Post(':userId')
  addOne(
    @Param('userId') userId: string,
    @Body() payload: Pick<Image, 'name' | 'content' | 'tags'>
  ) {
    return this.imageService.addOne(userId, payload);
  }

  @Put(':userId/:assetId')
  updateOne(
    @Param('userId') userId: string,
    @Param('assetId') assetId: string,
    @Body() payload: Partial<Image>
  ) {
    return this.imageService.updateOne(userId, assetId, payload);
  }

  @Delete(':userId/:assetId')
  deleteOne(
    @Param('userId') userId: string,
    @Param('assetId') assetId: string
  ) {
    return this.imageService.deleteOne(userId, assetId);
  }
}
