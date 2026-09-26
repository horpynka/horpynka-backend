import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { DishesModule } from './dishes/dishes.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { CashShiftsModule } from './cash-shifts/cash-shifts.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InventoryModule } from './inventory/inventory.module';
import { MenuModule } from './menu/menu.module';
import { APP_GUARD } from '@nestjs/core';
import { GlobalAuthGuard } from './common/guards/global-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') as string,
        port: configService.get<number>('DB_PORT') as number,
        username: configService.get<string>('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get<string>('DB_NAME') as string,
        entities: [],
        autoLoadEntities: true,
        migrations: ['./migrations/*.ts'],
        namingStrategy: new SnakeNamingStrategy(),
        invalidWhereValuesBehavior: {
          null: 'sql-null',
          undefined: 'ignore',
        },
        synchronize: false,
      }),
    }),
    CategoriesModule,
    DishesModule,
    IngredientsModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    DashboardModule,
    MenuModule,
    InventoryModule,
    CashShiftsModule,
    TransactionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AppModule {}
