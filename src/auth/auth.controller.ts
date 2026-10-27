import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Res,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignInUserDTO } from './dto/sign-in-user.dto';
import { AuthService } from './auth.service';
import { SignUpUserDTO } from './dto/sign-up-user.dto';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { CookieSerializeOptions } from '@fastify/cookie';
import { checkIsMobile } from '../common/utils/check-is-mobile';

@Controller('auth')
export class AuthController {
  refreshTokenOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  constructor(private authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AccessTokenResponseDto })
  async signIn(
    @Body() data: SignInUserDTO,
    @Headers('X-Client-Type') clientType: string | undefined,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshToken } = await this.authService.signIn(data);

    response.setCookie('refreshToken', refreshToken, this.refreshTokenOptions);

    if (checkIsMobile(clientType)) {
      return { accessToken, refreshToken };
    }

    return { accessToken };
  }

  @Post('sign-up')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AccessTokenResponseDto })
  async signUp(
    @Body() data: SignUpUserDTO,
    @Headers('X-Client-Type') clientType: string | string[] | undefined,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<AccessTokenResponseDto> {
    const { accessToken, refreshToken } = await this.authService.signUp(data);

    response.setCookie('refreshToken', refreshToken, this.refreshTokenOptions);

    if (checkIsMobile(clientType)) {
      return { accessToken, refreshToken };
    }

    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('X-Client-Type') clientType: string | undefined,
    @Body() body: RefreshTokenDto,
  ) {
    let refreshToken = request.cookies['refreshToken'] || '';
    if (checkIsMobile(clientType)) {
      refreshToken = body?.refreshToken || '';
    }

    const accessToken = await this.authService.refreshAccessToken(refreshToken);
    if (!accessToken) {
      response.clearCookie('refreshToken', this.refreshTokenOptions);
      throw new UnauthorizedException();
    }
    return { accessToken };
  }

  @Get('get-session')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SessionResponseDto })
  async getSession(
    @Req() request: FastifyRequest,
  ): Promise<SessionResponseDto> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : '';

    return this.authService.getSession(accessToken);
  }
}
