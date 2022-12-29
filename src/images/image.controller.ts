import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Controller,
} from '@nestjs/common';

import { ImageService } from './image.service';
import { Image } from './image.schema';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  getImages() {
    return this.imageService.getImages();
  }

  @Post()
  addImage(@Body() payload: Pick<Image, 'name' | 'content' | 'tags'>) {
    return this.imageService.addImage(payload);
  }

  @Put(':id')
  updateImage(@Param('id') _id: string, @Body() payload: Partial<Image>) {
    return this.imageService.updateImage(_id, payload);
  }

  @Delete(':id')
  removeImage(@Param('id') _id: string) {
    return this.imageService.removeImage(_id);
  }
}
