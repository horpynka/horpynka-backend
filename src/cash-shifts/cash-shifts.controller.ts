import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { CashShiftsService } from './cash-shifts.service';
import { CashShiftDto } from './dto/cash-shift.dto';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('cash-shifts')
@Controller('cash-shifts')
export class CashShiftsController {
  constructor(private readonly cashShiftsService: CashShiftsService) {}

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
}
