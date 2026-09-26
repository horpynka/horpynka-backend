import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from '../dishes/entities/dish.entity';
import { Product } from '../products/entities/product.entity';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, Product])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
