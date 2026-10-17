import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { MenuItemDto } from './dto/menu-item.dto';
import { UpdateMenuItemSellingDto } from './dto/update-menu-item-selling.dto';
import { MenuService } from './menu.service';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOkResponse({ type: MenuItemDto, isArray: true })
  findAll(): Promise<MenuItemDto[]> {
    return this.menuService.findAll();
  }

  @Get('catalog')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @ApiOkResponse({ type: MenuItemDto, isArray: true })
  findCatalog(): Promise<MenuItemDto[]> {
    return this.menuService.findCatalog();
  }

  @Patch(':id/selling')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @ApiOkResponse({ type: MenuItemDto })
  updateSelling(
    @Param('id') id: string,
    @Body() updateMenuItemSellingDto: UpdateMenuItemSellingDto,
  ): Promise<MenuItemDto> {
    return this.menuService.updateSelling(id, updateMenuItemSellingDto.selling);
  }
}
