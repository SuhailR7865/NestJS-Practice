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
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Google OAuth configuration is missing',
      );
    }

    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(googleTokenDto: GoogleTokenDto) {
    try {
      // Verify the Google Token Sent By User
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
        audience: this.jwtConfiguration.googleClientId,
      });
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

      if (!emailVerified || !email || !googleId) {
        throw new UnauthorizedException('Google account is not eligible');
      }

      // Find the user in the database using the googleId
      let user = await this.usersService.findOneByGoogleId(googleId);

      // If user id found generate the tokens
      if (!user) {
        // Reuse account if it already exists with same email.
        try {
          user = await this.usersService.findOneByEmail(email);
        } catch {
          // If not create a new user and generate the tokens.
          user = await this.usersService.createGoogleUser({
            email,
            firstName: firstName ?? 'Google',
            lastName: lastName ?? '',
            googleId,
          });
        }
      }

      return {
        message: 'Google authentication successful',
        userId: user.id,
        email: user.email,
      };

      // throw Unauthorised exception if not Authorised
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
