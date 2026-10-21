import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionsQueryDto } from './dto/transactions-query.dto';
import { TransactionsService } from './transactions.service';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiQuery({
    name: 'from',
    required: false,
    description:
      'Inclusive start date in Europe/Kyiv (YYYY-MM-DD). Omit for no lower bound.',
    example: '2026-10-11',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description:
      'Inclusive end date in Europe/Kyiv (YYYY-MM-DD). Omit for no upper bound.',
    example: '2026-10-17',
  })
  @ApiOkResponse({ type: TransactionDto, isArray: true })
  findAll(@Query() query: TransactionsQueryDto): Promise<TransactionDto[]> {
    return this.transactionsService.findAll(query);
  }
}
