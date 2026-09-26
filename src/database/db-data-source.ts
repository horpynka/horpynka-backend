import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { DishIngredient } from '../dishes/entities/dish-ingredient.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { Category } from '../categories/entities/category.entity';
import { CashShift } from '../cash-shifts/entities/cash-shift.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Product,
    Order,
    OrderItem,
    Ingredient,
    DishIngredient,
    Dish,
    Category,
    CashShift,
    Inventory,
    InventoryItem,
  ],
  migrations: [
    process.env.NODE_ENV === 'production'
      ? 'dist/migrations/*.js'
      : 'src/migrations/*.ts',
  ],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
});

export default AppDataSource;
