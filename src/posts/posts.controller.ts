import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePostDto } from './dtos/create-post.dto';
import { PatchPostDto } from './dtos/patch-post.dto';
import { GetPostsDto } from './dtos/get-post.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token/access-token.guard';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('posts')
@ApiTags('Posts')
export class PostsController {
  constructor(
    /*
     *  Injecting Posts Service
     */
    private readonly postsService: PostsService,
  ) {}

  /*
   * GET localhost:3000/posts
   */
  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({
    summary: 'Fetch posts for the currently logged-in user',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer access token',
    example: 'Bearer eyJhbGciOi...',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Current user posts returned successfully',
    schema: {
      example: {
        apiVersion: '1',
        data: {
          data: [
            {
              id: 21,
              title: 'My latest post',
              slug: 'my-latest-post',
            },
          ],
          meta: {
            itemsPerPage: 10,
            totalItems: 1,
            currentPage: 1,
            totalPages: 1,
          },
          links: {
            first: '/posts?limit=10&page=1',
            last: '/posts?limit=10&page=1',
            current: '/posts?limit=10&page=1',
            next: '/posts?limit=10&page=1',
            previous: '/posts?limit=10&page=1',
          },
        },
      },
    },
  })
  public getPosts(
    @ActiveUser('sub') userId: number,
    @Query() postQuery: GetPostsDto,
  ) {
    return this.postsService.findAll(postQuery, userId);
  }

  @ApiOperation({
    summary: 'Creates a new blog post',
  })
  @ApiResponse({
    status: 201,
    description: 'You get a 201 response if your post is created successfully',
  })
  @ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer access token',
    example: 'Bearer eyJhbGciOi...',
  })
  @ApiBody({
    type: CreatePostDto,
    examples: {
      default: {
        summary: 'Create post body',
        value: {
          title: 'My post',
          postType: 'post',
          slug: 'my-post',
          status: 'published',
          content: 'Hello world',
          tags: [1, 2],
          metaOptions: {
            metaValue: '{"sidebarEnabled":true}',
          },
        },
      },
    },
  })
  @UseGuards(AccessTokenGuard)
  @Post()
  public createPost(
    @ActiveUser('sub') userId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(createPostDto, userId);
  }

  @ApiOperation({
    summary: 'Updates an existing blog post',
  })
  @ApiResponse({
    status: 200,
    description: 'A 200 response if the post is updated successfully',
  })
  @ApiBody({
    type: PatchPostDto,
    examples: {
      default: {
        summary: 'Patch post body',
        value: {
          id: 21,
          title: 'Updated title',
          status: 'review',
          tags: [1, 2],
        },
      },
    },
  })
  @Patch()
  public updatePost(@Body() patchPostDto: PatchPostDto) {
    return this.postsService.update(patchPostDto);
  }

  @Delete()
  @ApiOperation({
    summary: 'Delete post by id',
  })
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
    example: 21,
  })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    schema: {
      example: {
        apiVersion: '1',
        data: {
          deleted: true,
          id: 21,
        },
      },
    },
  })
  public deletePost(@Query('id', ParseIntPipe) id: number) {
    return this.postsService.delete(id);
  }
}
