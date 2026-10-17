import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { CashShiftsService } from './cash-shifts.service';
import { CashShiftDto } from './dto/cash-shift.dto';
import { OpenCashShiftDto } from './dto/open-cash-shift.dto';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('cash-shifts')
@Controller('cash-shifts')
export class CashShiftsController {
  constructor(
    private readonly cashShiftsService: CashShiftsService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CashShiftDto })
  @ApiConflictResponse({ description: 'Вже є відкрита зміна' })
  async open(
    @Body() openCashShiftDto: OpenCashShiftDto,
    @Req() request: FastifyRequest,
  ): Promise<CashShiftDto> {
    const userId = await this.currentUserId(request);
    return this.cashShiftsService.open(openCashShiftDto, userId);
  }

  @Get()
  @ApiOkResponse({ type: CashShiftDto, isArray: true })
  findAll(): Promise<CashShiftDto[]> {
    return this.cashShiftsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: CashShiftDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CashShiftDto> {
    return this.cashShiftsService.findOne(id);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CashShiftDto })
  @ApiConflictResponse({ description: 'Зміну вже закрито' })
  close(@Param('id', ParseIntPipe) id: number): Promise<CashShiftDto> {
    return this.cashShiftsService.close(id);
  }

  private async currentUserId(request: FastifyRequest): Promise<number> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : '';
    const decoded = await this.authService.asyncVerifyToken<{
      userId?: number;
      sub?: number;
    }>(accessToken);
    const userId = decoded.userId ?? decoded.sub;

    if (typeof userId !== 'number') {
      throw new UnauthorizedException();
    }

    return userId;
  }
}
