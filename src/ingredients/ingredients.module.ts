import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishIngredient } from '../dishes/entities/dish-ingredient.entity';
import { Ingredient } from './entities/ingredient.entity';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient, DishIngredient])],
  controllers: [IngredientsController],
  providers: [IngredientsService],
  exports: [TypeOrmModule],
})
export class IngredientsModule {}
