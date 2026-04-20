import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class SignInProvider {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject the hashingProvider
     */
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    console.log('[SignInProvider] signIn called', {
      email: signInDto.email,
    });

    // find user by email ID
    let user = await this.usersService.findOneByEmail(signInDto.email);
    console.log('[SignInProvider] User lookup complete', {
      userId: user.id,
      email: user.email,
    });
    // Throw exception if user is not found
    // Above | Taken care by the findInByEmail method

    let isEqual: boolean = false;

    try {
      // Compare the password to hash
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
      console.log('[SignInProvider] Password comparison complete', {
        isEqual,
      });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the password',
      });
    }

    if (!isEqual) {
      console.log('[SignInProvider] Invalid password');
      throw new UnauthorizedException('Password does not match');
    }

    const response = {
      message: 'Sign in successful',
      userId: user.id,
      email: user.email,
    };

    console.log('[SignInProvider] Returning sign-in response shape', {
      keys: Object.keys(response),
      userId: response.userId,
      email: response.email,
    });

    return response;
  }
}
