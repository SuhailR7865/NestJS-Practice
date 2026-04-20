import { MetaOption } from 'src/meta-options/meta-option.entity';
import { Module } from '@nestjs/common';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { Post } from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './providers/posts.service';
import { TagsModule } from 'src/tags/tags.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { CreatePostProvider } from './providers/create-post.provider';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';

@Module({
  controllers: [PostsController],
  providers: [PostsService, CreatePostProvider],
  imports: [
    UsersModule,
    TagsModule,
    PaginationModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          audience: configService.get('jwt.audience'),
          issuer: configService.get('jwt.issuer'),
        },
      }),
    }),
    TypeOrmModule.forFeature([Post, MetaOption]),
  ],
})
export class PostsModule {}
