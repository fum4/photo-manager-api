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
  findAll() {
    return this.imageService.findAll();
  }

  @Post()
  addOne(@Body() payload: Pick<Image, 'name' | 'content' | 'tags'>) {
    return this.imageService.addOne(payload);
  }

  @Put(':id')
  updateOne(@Param('id') _id: string, @Body() payload: Partial<Image>) {
    return this.imageService.updateOne(_id, payload);
  }

  @Delete(':id')
  deleteOne(@Param('id') _id: string) {
    return this.imageService.deleteOne(_id);
  }
}
