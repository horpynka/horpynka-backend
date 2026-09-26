import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOkResponse({ type: TransactionDto, isArray: true })
  findAll(): Promise<TransactionDto[]> {
    return this.transactionsService.findAll();
  }
}
