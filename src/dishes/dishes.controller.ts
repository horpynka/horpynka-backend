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
import { Dish } from './entities/dish.entity';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Post()
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  create(@Body() createDishDto: CreateDishDto): Promise<Dish> {
    return this.dishesService.create(createDishDto);
  }

  @Get()
  findAll(): Promise<Dish[]> {
    return this.dishesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Dish> {
    return this.dishesService.findOne(id);
  }

  @Patch(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
  ): Promise<Dish> {
    return this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConflictResponse({
    description: 'Страву не можна видалити, бо вона є в замовленнях',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dishesService.remove(id);
  }
}
