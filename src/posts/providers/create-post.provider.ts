import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsService } from 'src/tags/providers/tags.service';

@Injectable()
export class CreatePostProvider {
  constructor(
    /*
     * Injecting Users Service
     */
    private readonly usersService: UsersService,
    /**
     * Inject postsRepository
     */
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    /**
     * Inject TagsService
     */
    private readonly tagsService: TagsService,
  ) {}

  public async create(createPostDto: CreatePostDto, authorId: number) {
    let author = undefined;
    let tags = [];
    const tagIds = createPostDto.tags ?? [];

    try {
      // Find author from database based on authorId
      author = await this.usersService.findOneById(authorId);
      // Find tags
      tags = await this.tagsService.findMultipleTags(tagIds);
    } catch (error) {
      throw new ConflictException(error);
    }

    if (tagIds.length !== tags.length) {
      throw new BadRequestException('Please check your tag Ids');
    }

    // Create post
    let post = this.postsRepository.create({
      ...createPostDto,
      author: author,
      tags: tags,
    });

    try {
      // return the post
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Ensure post slug is unique and not a duplicate',
      });
    }
  }
}
