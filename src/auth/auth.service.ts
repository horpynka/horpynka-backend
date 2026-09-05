import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { comparePasswords, hashPassword } from './password.util';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { SignInUserDTO } from './dto/sign-in-user.dto';
import { SignUpUserDTO } from './dto/sign-up-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async signIn(data: SignInUserDTO) {
    const user = await this.usersService.findOne(data);
    if (!user) {
      throw new UnauthorizedException('Such a user does not exist');
    }

    const passwordIsCorrect = await comparePasswords(
      data.password,
      user.password,
    );

    if (!passwordIsCorrect) {
      throw new UnauthorizedException('Username or password is wrong');
    }

    return await this.createJwtTokens(user);
  }

  async signUp(data: SignUpUserDTO) {
    const { email, password } = data;
    const existingUser = await this.usersService.findOne({
      email,
    });
    if (existingUser) {
      throw new ConflictException('Такий імейл вже зайнятий');
    }

    const saltRounds = Number(
      this.configService.get('PASSWORD_HASH_SALT') ?? 10,
    );
    const hashedPassword = await hashPassword(password, saltRounds);
    const newUser = await this.usersService.createNewUser({
      email,
      password: hashedPassword,
    });
    if (!newUser) {
      throw new InternalServerErrorException('Не вдалося створити користувача');
    }

    return await this.createJwtTokens(newUser);
  }

  async createJwtTokens(user: User) {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    if (!accessToken || !refreshToken) {
      throw new InternalServerErrorException(
        'Failed to create tokens for authentication',
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decodedToken: { email: string } =
        await this.asyncVerifyToken(refreshToken);
      if (!decodedToken) {
        throw new UnauthorizedException();
      }

      const user = await this.usersService.findOne({
        email: decodedToken.email,
      });
      if (!user) {
        throw new UnauthorizedException();
      }
      const newAccessToken = await this.createAccessToken(user);
      return {
        accessToken: newAccessToken,
      };
    } catch {
      return null;
    }
  }

  async createAccessToken(user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      roles: user.roles,
      email: user.email,
      userId: user.id,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async createRefreshToken(user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      roles: user.roles,
      email: user.email,
      userId: user.id,
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async asyncVerifyToken<T extends object>(token: string) {
    try {
      const secret = this.configService.get('JWT_SECRET_KEY') as string;
      const decodedToken: T = await this.jwtService.verifyAsync(token, {
        secret,
      });
      return decodedToken;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
