import {
  InternalServerErrorException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from 'src/users/providers/users.service';
import { GoogleTokenDto } from '../dtos/google-token.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    /**
     * Inject jwtConfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;

    console.log('[GoogleAuthService] onModuleInit called', {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
    });

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Google OAuth configuration is missing',
      );
    }

    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(googleTokenDto: GoogleTokenDto) {
    console.log('[GoogleAuthService] authenticate called', {
      tokenLength: googleTokenDto?.token?.length ?? 0,
    });

    try {
      // Verify the Google Token Sent By User
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
        audience: this.jwtConfiguration.googleClientId,
      });
      console.log('[GoogleAuthService] Google token verified');
      const payload = loginTicket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      // Extract the payload from Google Token
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
        email_verified: emailVerified,
      } = payload;

      console.log('[GoogleAuthService] Payload extracted', {
        email,
        googleId,
        firstName,
        lastName,
        emailVerified,
      });

      if (!emailVerified || !email || !googleId) {
        throw new UnauthorizedException('Google account is not eligible');
      }

      // Find the user in the database using the googleId
      let user = await this.usersService.findOneByGoogleId(googleId);
      console.log('[GoogleAuthService] Lookup by googleId complete', {
        foundByGoogleId: Boolean(user),
      });

      // If user id found generate the tokens
      if (!user) {
        // Reuse account if it already exists with same email.
        try {
          user = await this.usersService.findOneByEmail(email);
          console.log('[GoogleAuthService] Reused existing email account', {
            email,
            userId: user.id,
          });
        } catch {
          // If not create a new user and generate the tokens.
          user = await this.usersService.createGoogleUser({
            email,
            firstName: firstName ?? 'Google',
            lastName: lastName ?? '',
            googleId,
          });
          console.log('[GoogleAuthService] Created new google user', {
            email,
            userId: user.id,
          });
        }
      }

      const tokens = await this.generateTokens(user.id, user.email);
      const response = {
        message: 'Google authentication successful',
        userId: user.id,
        email: user.email,
        ...tokens,
      };

      console.log('[GoogleAuthService] Returning success response', {
        keys: Object.keys(response),
        userId: response.userId,
        email: response.email,
        hasAccessToken: Boolean(response.accessToken),
        hasRefreshToken: Boolean(response.refreshToken),
      });

      return response;

      // throw Unauthorised exception if not Authorised
    } catch (error) {
      console.log('[GoogleAuthService] authenticate failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException(error);
    }
  }

  private async generateTokens(userId: number, email: string) {
    console.log('[GoogleAuthService] Generating JWT tokens', {
      userId,
      email,
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          expiresIn: this.jwtConfiguration.accessTokenTtl,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          expiresIn: this.jwtConfiguration.refreshTokenTtl,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
