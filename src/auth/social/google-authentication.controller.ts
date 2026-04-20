import { GoogleAuthenticationService } from './providers/google-authentication.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('auth/google-authentication')
export class GoogleAuthenticationController {
  constructor(
    /**
     * Inject googleAuthenticationService
     */
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
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
