import { SignInProvider } from './sign-in.provider';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';

import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import jwtConfig from '../config/jwt.config';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject the signInProvider
     */
    private readonly signInProvider: SignInProvider,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signIn(signInDto: SignInDto) {
    console.log('[AuthService] signIn called', {
      email: signInDto.email,
    });

    const signInResult = await this.signInProvider.signIn(signInDto);
    const tokens = await this.generateTokens(
      signInResult.userId,
      signInResult.email,
    );

    const response = {
      ...signInResult,
      ...tokens,
    };

    console.log('[AuthService] signIn response shape', {
      keys: Object.keys(response),
      userId: response.userId,
      email: response.email,
      hasAccessToken: Boolean(response.accessToken),
      hasRefreshToken: Boolean(response.refreshToken),
    });

    return response;
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    console.log('[AuthService] refreshTokens called');

    let payload: { sub: number };

    try {
      payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOneById(payload.sub);
    const { accessToken } = await this.generateTokens(user.id, user.email);

    const response = {
      message: 'Tokens refreshed successfully',
      accessToken,
    };

    console.log('[AuthService] refreshTokens response shape', {
      keys: Object.keys(response),
      userId: user.id,
      email: user.email,
      hasAccessToken: Boolean(response.accessToken),
    });

    return response;
  }

  private async generateTokens(userId: number, email: string) {
    console.log('[AuthService] generateTokens called', {
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
