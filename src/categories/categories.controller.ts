import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindAllCategoriesResponseDto } from './dto/find-all-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @ApiCreatedResponse({ type: CategoryResponseDto })
  @ApiBadRequestResponse({
    description: 'Порожня назва або дублікат імені',
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOkResponse({ type: FindAllCategoriesResponseDto })
  findAll(): Promise<FindAllCategoriesResponseDto> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiBadRequestResponse({
    description: 'Порожня назва або дублікат чужого імені',
  })
  @ApiNotFoundResponse({ description: 'Категорію не знайдено' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNotFoundResponse({ description: 'Категорію не знайдено' })
  @ApiConflictResponse({
    description:
      'Категорія прив’язана до товарів або страв. Тіло містить кількості.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
