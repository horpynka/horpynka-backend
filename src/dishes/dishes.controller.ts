import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Dish } from './entities/dish.entity';
import { DishesService } from './dishes.service';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  findAll(): Promise<Dish[]> {
    return this.dishesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Dish> {
    return this.dishesService.findOne(id);
  }
}
