import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { DashboardService } from './dashboard.service';
import { DashboardStatsQueryDto } from './dto/dashboard-stats-query.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Inclusive start date in Europe/Kyiv (YYYY-MM-DD)',
    example: '2026-10-11',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Inclusive end date in Europe/Kyiv (YYYY-MM-DD)',
    example: '2026-10-17',
  })
  @ApiOkResponse({ type: DashboardStatsDto })
  getStats(@Query() query: DashboardStatsQueryDto): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats(query);
  }
}
