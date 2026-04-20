import { CreatePostMetaOptionsDto } from './dtos/create-post-meta-options.dto';
import { MetaOptionsService } from './providers/meta-options.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('meta-options')
@ApiTags('Meta Options')
export class MetaOptionsController {
  constructor(
    /**
     * Inject MetaOptionsService
     * */
    private readonly MetaOptionsService: MetaOptionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create post meta options',
  })
  @ApiBody({
    type: CreatePostMetaOptionsDto,
    examples: {
      default: {
        summary: 'Create meta options body',
        value: {
          metaValue: '{"sidebarEnabled":true,"theme":"dark"}',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Meta options created successfully',
  })
  public async create(
    @Body() createPostMetaOptionsDto: CreatePostMetaOptionsDto,
  ) {
    return this.MetaOptionsService.create(createPostMetaOptionsDto);
  }
}
