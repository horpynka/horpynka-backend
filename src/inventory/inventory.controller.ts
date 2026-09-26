import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { InventoryDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOkResponse({ type: InventoryDto, isArray: true })
  findAll(): Promise<InventoryDto[]> {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: InventoryDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<InventoryDto> {
    return this.inventoryService.findOne(id);
  }
}
