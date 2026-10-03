import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { FindAllCategoriesResponseDto } from './dto/find-all-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOkResponse({ type: FindAllCategoriesResponseDto })
  findAll(): Promise<FindAllCategoriesResponseDto> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}
