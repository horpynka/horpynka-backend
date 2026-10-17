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
import { ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';
import {
  INGREDIENT_NAME_TAKEN_MESSAGE,
  INGREDIENT_UNIT_LOCKED_MESSAGE,
  IngredientsService,
} from './ingredients.service';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @ApiConflictResponse({ description: INGREDIENT_NAME_TAKEN_MESSAGE })
  create(
    @Body() createIngredientDto: CreateIngredientDto,
  ): Promise<Ingredient> {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll(): Promise<Ingredient[]> {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Ingredient> {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @ApiConflictResponse({
    description: `${INGREDIENT_NAME_TAKEN_MESSAGE}. ${INGREDIENT_UNIT_LOCKED_MESSAGE}.`,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConflictResponse({
    description:
      'Інгредієнт використовується в стравах, спочатку приберіть його з їхнього складу',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ingredientsService.remove(id);
  }
}
