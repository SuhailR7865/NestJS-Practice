import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Body,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersParamDto } from './dtos/get-users-param.dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UsersService } from './providers/users.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateManyUsersDto } from './dtos/create-many-users.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    // Injecting Users Service
    private readonly usersService: UsersService,
  ) {}

  @Get('/:id?')
  @ApiOperation({
    summary: 'Fetches a list of registered users on the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully based on the query',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'The number of entries returned per query',
    example: 10,
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description:
      'The position of the page number that you want the API to return',
    example: 1,
  })
  public getUsers(
    @Param() getUserParamDto: GetUsersParamDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.usersService.findAll(getUserParamDto, limit, page);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Create a single user',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Create user body',
        value: {
          firstName: 'Mark',
          lastName: 'Doe',
          email: 'mark@doe.com',
          password: 'Password123#',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  public createUsers(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post('create-many')
  @ApiOperation({
    summary: 'Create multiple users',
  })
  @ApiBody({
    type: CreateManyUsersDto,
    examples: {
      default: {
        summary: 'Create many users body',
        value: {
          users: [
            {
              firstName: 'Mark',
              lastName: 'Doe',
              email: 'mark@doe.com',
              password: 'Password123#',
            },
            {
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@doe.com',
              password: 'Password123#',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Users created successfully',
  })
  public createManyUsers(@Body() createManyUsersDto: CreateManyUsersDto) {
    return this.usersService.createMany(createManyUsersDto);
  }

  @Patch()
  @ApiOperation({
    summary: 'Patch an existing user',
  })
  @ApiBody({
    type: PatchUserDto,
    examples: {
      default: {
        summary: 'Patch user body',
        value: {
          firstName: 'UpdatedName',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User patched successfully',
  })
  public patchUser(@Body() patchUserDto: PatchUserDto) {
    return patchUserDto;
  }
}
