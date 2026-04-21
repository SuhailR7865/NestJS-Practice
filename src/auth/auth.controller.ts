import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './providers/auth.service';
import { SignInDto } from './dtos/signin.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    /*
     * Injecting Auth Service
     */
    private readonly authService: AuthService,
  ) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
  })
  @ApiBody({
    type: SignInDto,
    examples: {
      default: {
        summary: 'Standard sign-in request',
        value: {
          email: 'mark@doe.com',
          password: 'Password123#',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful and JWT tokens returned',
    schema: {
      example: {
        apiVersion: '1',
        data: {
          message: 'Sign in successful',
          userId: 9,
          email: 'mark@doe.com',
          accessToken: 'eyJhbGciOi...',
          refreshToken: 'eyJhbGciOi...',
        },
      },
    },
  })
  public signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a new access token using refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      default: {
        summary: 'Refresh token request',
        value: {
          refreshToken: 'eyJhbGciOi...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
    schema: {
      example: {
        apiVersion: '1',
        data: {
          message: 'Tokens refreshed successfully',
          accessToken: 'eyJhbGciOi...',
        },
      },
    },
  })
  public refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
