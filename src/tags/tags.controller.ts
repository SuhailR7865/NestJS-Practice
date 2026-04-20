import {
  Body,
  Controller,
  Delete,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTagDto } from './dtos/create-tag.dto';
import { TagsService } from './providers/tags.service';

@Controller('tags')
@ApiTags('Tags')
export class TagsController {
  constructor(
    /**
     * Inject  tagsService
     */
    private readonly tagsService: TagsService,
  ) {}
  @Post()
  @ApiOperation({
    summary: 'Create a new tag',
  })
  @ApiBody({
    type: CreateTagDto,
    examples: {
      default: {
        summary: 'Create tag body',
        value: {
          name: 'Technology',
          slug: 'technology',
          description: 'Tag for tech posts',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
  })
  public create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Hard delete a tag by id',
  })
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully',
  })
  public delete(@Query('id', ParseIntPipe) id: number) {
    return this.tagsService.delete(id);
  }

  @Delete('soft-delete')
  @ApiOperation({
    summary: 'Soft delete a tag by id',
  })
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Tag soft-deleted successfully',
  })
  public softDelete(@Query('id', ParseIntPipe) id: number) {
    return this.tagsService.softRemove(id);
  }
}
