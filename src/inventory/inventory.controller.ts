import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { AuthService } from 'src/auth/auth.service';
import { InventoryDto } from './dto/inventory.dto';
import { SaveInventoryDto } from './dto/save-inventory.dto';
import {
  INVENTORY_ACTUALS_REQUIRED_MESSAGE,
  INVENTORY_LOCKED_MESSAGE,
  InventoryService,
} from './inventory.service';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: InventoryDto })
  async startInventory(@Req() request: FastifyRequest): Promise<InventoryDto> {
    const responsible = await this.responsibleEmail(request);
    return this.inventoryService.start(responsible);
  }

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

  @Patch(':id')
  @ApiOkResponse({ type: InventoryDto })
  @ApiConflictResponse({ description: INVENTORY_LOCKED_MESSAGE })
  saveInventoryActualQuantities(
    @Param('id', ParseIntPipe) id: number,
    @Body() saveInventoryDto: SaveInventoryDto,
  ): Promise<InventoryDto> {
    return this.inventoryService.saveActualQuantities(id, saveInventoryDto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: InventoryDto })
  @ApiBadRequestResponse({ description: INVENTORY_ACTUALS_REQUIRED_MESSAGE })
  @ApiConflictResponse({ description: INVENTORY_LOCKED_MESSAGE })
  completeInventory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InventoryDto> {
    return this.inventoryService.complete(id);
  }

  private async responsibleEmail(request: FastifyRequest): Promise<string> {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : '';
    const session = await this.authService.getSession(accessToken);
    return session.email;
  }
}
