import { GoogleAuthenticationService } from './providers/google-authentication.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Auth(AuthType.None)
@Controller('auth/google-authentication')
@ApiTags('Auth')
export class GoogleAuthenticationController {
  constructor(
    /**
     * Inject googleAuthenticationService
     */
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with Google ID token',
  })
  @ApiBody({
    type: GoogleTokenDto,
    examples: {
      default: {
        summary: 'Google auth request',
        value: {
          token: 'GOOGLE_ID_TOKEN_FROM_FRONTEND',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Google login successful and JWT tokens returned',
    schema: {
      example: {
        apiVersion: '1',
        data: {
          message: 'Google authentication successful',
          userId: 9,
          email: 'mark@doe.com',
          accessToken: 'eyJhbGciOi...',
          refreshToken: 'eyJhbGciOi...',
        },
      },
    },
  })
  async authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    console.log('[GoogleAuthController] Endpoint hit', {
      tokenLength: googleTokenDto?.token?.length ?? 0,
    });

    const response =
      await this.googleAuthenticationService.authenticate(googleTokenDto);

    console.log('[GoogleAuthController] Response shape to frontend', {
      keys: Object.keys(response),
      userId: response.userId,
      email: response.email,
      hasAccessToken: Boolean(response.accessToken),
      hasRefreshToken: Boolean(response.refreshToken),
    });

    return response;
  }
}
