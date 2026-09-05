import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { DishIngredient } from '../dishes/entities/dish-ingredient.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Product } from '../products/entities/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'postgres',
  entities: [
    User,
    Category,
    Dish,
    DishIngredient,
    Ingredient,
    Product,
    Order,
    OrderItem,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database. Seeding...\n');

  try {
    // Clear in reverse FK-dependency order
    await AppDataSource.query(`
      TRUNCATE TABLE
        order_item,
        "order",
        dish_ingredient,
        dish,
        product,
        ingredient,
        category,
        users
      RESTART IDENTITY CASCADE;
    `);
    console.log('Cleared existing data.');

    // ── CATEGORIES ───────────────────────────────────────────────────────────
    const categoryRepo = AppDataSource.getRepository(Category);
    const categories = categoryRepo.create([
      { name: 'Перші страви' },
      { name: 'Другі страви' },
      { name: 'Напої' },
      { name: 'Десерти' },
      { name: 'Напої' },
      { name: 'Снеки' },
    ]);
    await categoryRepo.save(categories);
    console.log('Seeded categories.');

    const [pershiStravy, drugiStravy, napoi, deserty, napoiP, snekyP] =
      categories;
    const today = new Date();

    // ── INGREDIENTS ──────────────────────────────────────────────────────────
    const ingredientRepo = AppDataSource.getRepository(Ingredient);
    const ingredients = ingredientRepo.create([
      { measurementUnit: 'г' }, // 1 – м'ясо
      { measurementUnit: 'г' }, // 2 – картопля
      { measurementUnit: 'мл' }, // 3 – бульйон
      { measurementUnit: 'г' }, // 4 – борошно
      { measurementUnit: 'г' }, // 5 – цибуля
      { measurementUnit: 'г' }, // 6 – морква
      { measurementUnit: 'мл' }, // 7 – олія
      { measurementUnit: 'г' }, // 8 – сіль
      { measurementUnit: 'г' }, // 9 – перець
      { measurementUnit: 'мл' }, // 10 – вода
    ]);
    await ingredientRepo.save(ingredients);
    console.log('Seeded ingredients.');

    // ── DISHES ───────────────────────────────────────────────────────────────
    const dishRepo = AppDataSource.getRepository(Dish);
    const dishes = dishRepo.create([
      {
        name: 'Борщ',
        category: pershiStravy,
        ownPrice: 4500,
        sellingPrice: 8900,
        selling: true,
      },
      {
        name: 'Курячий суп',
        category: pershiStravy,
        ownPrice: 5000,
        sellingPrice: 9500,
        selling: true,
      },
      {
        name: 'Вареники з мʼясом',
        category: drugiStravy,
        ownPrice: 8000,
        sellingPrice: 14000,
        selling: true,
      },
      {
        name: 'Голубці',
        category: drugiStravy,
        ownPrice: 7500,
        sellingPrice: 13500,
        selling: true,
      },
      {
        name: 'Деруни',
        category: drugiStravy,
        ownPrice: 6000,
        sellingPrice: 11000,
        selling: true,
      },
      {
        name: 'Котлета по-київськи',
        category: drugiStravy,
        ownPrice: 6500,
        sellingPrice: 12000,
        selling: false,
      },
      {
        name: 'Узвар',
        category: napoi,
        ownPrice: 800,
        sellingPrice: 3500,
        selling: true,
      },
      {
        name: 'Компот',
        category: napoi,
        ownPrice: 600,
        sellingPrice: 2800,
        selling: true,
      },
      {
        name: 'Сирники',
        category: deserty,
        ownPrice: 3500,
        sellingPrice: 7500,
        selling: true,
      },
      {
        name: 'Торт Наполеон',
        category: deserty,
        ownPrice: 4000,
        sellingPrice: 8000,
        selling: false,
      },
      {
        name: 'Юшка грибна',
        category: pershiStravy,
        ownPrice: 5200,
        sellingPrice: 9800,
        selling: true,
      },
      {
        name: 'Банош',
        category: drugiStravy,
        ownPrice: 7000,
        sellingPrice: 12900,
        selling: true,
      },
      {
        name: 'Печеня по-домашньому',
        category: drugiStravy,
        ownPrice: 8200,
        sellingPrice: 14900,
        selling: true,
      },
      {
        name: 'Млинці з сиром',
        category: deserty,
        ownPrice: 3200,
        sellingPrice: 6900,
        selling: true,
      },
      {
        name: 'Квас',
        category: napoi,
        ownPrice: 700,
        sellingPrice: 3000,
        selling: true,
      },
      {
        name: 'Розсольник',
        category: pershiStravy,
        ownPrice: 4800,
        sellingPrice: 9100,
        selling: true,
      },
      {
        name: 'Солянка',
        category: pershiStravy,
        ownPrice: 5600,
        sellingPrice: 10200,
        selling: true,
      },
      {
        name: 'Капусняк',
        category: pershiStravy,
        ownPrice: 4700,
        sellingPrice: 9000,
        selling: true,
      },
      {
        name: 'Крем-суп гарбузовий',
        category: pershiStravy,
        ownPrice: 5100,
        sellingPrice: 9600,
        selling: true,
      },
      {
        name: 'Суп з фрикадельками',
        category: pershiStravy,
        ownPrice: 5300,
        sellingPrice: 9900,
        selling: true,
      },
      {
        name: 'Зелений борщ',
        category: pershiStravy,
        ownPrice: 4950,
        sellingPrice: 9300,
        selling: true,
      },
      {
        name: 'Рибна юшка',
        category: pershiStravy,
        ownPrice: 5900,
        sellingPrice: 10800,
        selling: true,
      },
      {
        name: 'Плов',
        category: drugiStravy,
        ownPrice: 7800,
        sellingPrice: 14200,
        selling: true,
      },
      {
        name: 'Відбивна зі свинини',
        category: drugiStravy,
        ownPrice: 8400,
        sellingPrice: 15200,
        selling: true,
      },
      {
        name: 'Гречка з грибами',
        category: drugiStravy,
        ownPrice: 5200,
        sellingPrice: 9800,
        selling: true,
      },
      {
        name: 'Печена картопля з мʼясом',
        category: drugiStravy,
        ownPrice: 7600,
        sellingPrice: 13800,
        selling: true,
      },
      {
        name: 'Морс журавлинний',
        category: napoi,
        ownPrice: 900,
        sellingPrice: 3600,
        selling: true,
      },
      {
        name: 'Лимонад домашній',
        category: napoi,
        ownPrice: 1000,
        sellingPrice: 3900,
        selling: true,
      },
      {
        name: 'Чай чорний',
        category: napoi,
        ownPrice: 500,
        sellingPrice: 2200,
        selling: true,
      },
      {
        name: 'Чай зелений',
        category: napoi,
        ownPrice: 550,
        sellingPrice: 2300,
        selling: true,
      },
      {
        name: 'Кава американо',
        category: napoi,
        ownPrice: 700,
        sellingPrice: 2800,
        selling: true,
      },
      {
        name: 'Кава капучино',
        category: napoi,
        ownPrice: 900,
        sellingPrice: 3600,
        selling: true,
      },
      {
        name: 'Какао',
        category: napoi,
        ownPrice: 800,
        sellingPrice: 3200,
        selling: true,
      },
      {
        name: 'Медівник',
        category: deserty,
        ownPrice: 3600,
        sellingPrice: 7600,
        selling: true,
      },
      {
        name: 'Чізкейк',
        category: deserty,
        ownPrice: 4200,
        sellingPrice: 8400,
        selling: true,
      },
      {
        name: 'Штрудель яблучний',
        category: deserty,
        ownPrice: 3900,
        sellingPrice: 8100,
        selling: true,
      },
      {
        name: 'Пані-котта',
        category: deserty,
        ownPrice: 3400,
        sellingPrice: 7300,
        selling: true,
      },
      {
        name: 'Наполеон порційний',
        category: deserty,
        ownPrice: 3800,
        sellingPrice: 7900,
        selling: true,
      },
      {
        name: 'Еклери',
        category: deserty,
        ownPrice: 3100,
        sellingPrice: 6800,
        selling: true,
      },
      {
        name: 'Морозиво пломбір',
        category: deserty,
        ownPrice: 2600,
        sellingPrice: 5900,
        selling: true,
      },
    ]);
    for (const dish of dishes) {
      dish.createdAt = today;
      dish.updatedAt = today;
    }
    await dishRepo.save(dishes);
    console.log('Seeded dishes.');

    // ── DISH INGREDIENTS ─────────────────────────────────────────────────────
    const dishIngredientRepo = AppDataSource.getRepository(DishIngredient);
    const dishIngredients = dishIngredientRepo.create([
      { dish: dishes[0], ingredient: ingredients[0] },
      { dish: dishes[0], ingredient: ingredients[2] },
      { dish: dishes[0], ingredient: ingredients[4] },
      { dish: dishes[1], ingredient: ingredients[0] },
      { dish: dishes[1], ingredient: ingredients[1] },
      { dish: dishes[1], ingredient: ingredients[2] },
      { dish: dishes[2], ingredient: ingredients[0] },
      { dish: dishes[2], ingredient: ingredients[3] },
      { dish: dishes[2], ingredient: ingredients[6] },
      { dish: dishes[3], ingredient: ingredients[0] },
      { dish: dishes[3], ingredient: ingredients[4] },
      { dish: dishes[3], ingredient: ingredients[5] },
      { dish: dishes[4], ingredient: ingredients[1] },
      { dish: dishes[4], ingredient: ingredients[6] },
      { dish: dishes[5], ingredient: ingredients[0] },
      { dish: dishes[5], ingredient: ingredients[3] },
      { dish: dishes[6], ingredient: ingredients[9] },
      { dish: dishes[7], ingredient: ingredients[9] },
      { dish: dishes[8], ingredient: ingredients[3] },
      { dish: dishes[8], ingredient: ingredients[7] },
      { dish: dishes[9], ingredient: ingredients[3] },
      { dish: dishes[9], ingredient: ingredients[8] },
      { dish: dishes[10], ingredient: ingredients[2] },
      { dish: dishes[10], ingredient: ingredients[4] },
      { dish: dishes[10], ingredient: ingredients[5] },
      { dish: dishes[11], ingredient: ingredients[1] },
      { dish: dishes[11], ingredient: ingredients[7] },
      { dish: dishes[11], ingredient: ingredients[8] },
      { dish: dishes[12], ingredient: ingredients[0] },
      { dish: dishes[12], ingredient: ingredients[1] },
      { dish: dishes[12], ingredient: ingredients[5] },
      { dish: dishes[13], ingredient: ingredients[3] },
      { dish: dishes[13], ingredient: ingredients[7] },
      { dish: dishes[13], ingredient: ingredients[8] },
      { dish: dishes[14], ingredient: ingredients[7] },
      { dish: dishes[14], ingredient: ingredients[9] },
    ]);
    await dishIngredientRepo.save(dishIngredients);
    console.log('Seeded dish ingredients.');

    // ── PRODUCTS ─────────────────────────────────────────────────────────────
    const productRepo = AppDataSource.getRepository(Product);
    const products = productRepo.create([
      {
        name: 'Кола',
        ownPrice: 350,
        sellingPrice: 900,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Вода мінеральна',
        ownPrice: 200,
        sellingPrice: 600,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Сік апельсиновий',
        ownPrice: 400,
        sellingPrice: 1000,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Енергетик',
        ownPrice: 500,
        sellingPrice: 1200,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Пиво',
        ownPrice: 450,
        sellingPrice: 1100,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Чіпси',
        ownPrice: 300,
        sellingPrice: 800,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Сухарики',
        ownPrice: 150,
        sellingPrice: 500,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Горішки солоні',
        ownPrice: 400,
        sellingPrice: 950,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Шоколадний батончик',
        ownPrice: 350,
        sellingPrice: 850,
        category: snekyP,
        selling: false,
      },
      {
        name: 'Жувальна гумка',
        ownPrice: 50,
        sellingPrice: 200,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Фанта',
        ownPrice: 340,
        sellingPrice: 900,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Спрайт',
        ownPrice: 340,
        sellingPrice: 900,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Холодний чай',
        ownPrice: 300,
        sellingPrice: 850,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Тонік',
        ownPrice: 280,
        sellingPrice: 780,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Сік томатний',
        ownPrice: 360,
        sellingPrice: 920,
        category: napoiP,
        selling: true,
      },
      {
        name: 'Крекери',
        ownPrice: 180,
        sellingPrice: 520,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Соломка солона',
        ownPrice: 140,
        sellingPrice: 450,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Попкорн',
        ownPrice: 260,
        sellingPrice: 700,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Кукурудзяні палички',
        ownPrice: 160,
        sellingPrice: 480,
        category: snekyP,
        selling: true,
      },
      {
        name: 'Печиво вівсяне',
        ownPrice: 220,
        sellingPrice: 620,
        category: snekyP,
        selling: true,
      },
    ]);
    for (const product of products) {
      product.createdAt = today;
      product.updatedAt = today;
    }
    await productRepo.save(products);
    console.log('Seeded products.');

    // ── ORDERS ───────────────────────────────────────────────────────────────
    const orderRepo = AppDataSource.getRepository(Order);
    const now = new Date();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

    const orders = orderRepo.create([
      {
        orderPrice: 28700,
        paidWithCash: 28700,
        paidWithCard: 0,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.COMPLETED,
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      },
      {
        orderPrice: 17900,
        paidWithCash: 0,
        paidWithCard: 17900,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.COMPLETED,
        createdAt: daysAgo(7),
        updatedAt: daysAgo(7),
      },
      {
        orderPrice: 24500,
        paidWithCash: 10000,
        paidWithCard: 14500,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.COMPLETED,
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      },
      {
        orderPrice: 10500,
        paidWithCash: 10500,
        paidWithCard: 0,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.PAID,
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
      },
      {
        orderPrice: 17350,
        paidWithCash: 0,
        paidWithCard: 17350,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.PAID,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        orderPrice: 16400,
        paidWithCash: 0,
        paidWithCard: 0,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.CREATED,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      {
        orderPrice: 9400,
        paidWithCash: 0,
        paidWithCard: 0,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.CREATED,
        createdAt: daysAgo(0),
        updatedAt: daysAgo(0),
      },
      {
        orderPrice: 12900,
        paidWithCash: 12900,
        paidWithCard: 0,
        refundedWithCash: 12900,
        refundedWithCard: 0,
        status: OrderStatus.REFUNDED,
        createdAt: daysAgo(9),
        updatedAt: daysAgo(9),
      },
      {
        orderPrice: 8400,
        paidWithCash: 0,
        paidWithCard: 0,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.CANCELLED,
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6),
      },
      {
        orderPrice: 16400,
        paidWithCash: 16400,
        paidWithCard: 0,
        refundedWithCash: 0,
        refundedWithCard: 0,
        status: OrderStatus.COMPLETED,
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
    ]);
    await orderRepo.save(orders);
    console.log('Seeded orders.');

    // ── ORDER ITEMS ──────────────────────────────────────────────────────────
    const orderItemRepo = AppDataSource.getRepository(OrderItem);
    const orderItems = orderItemRepo.create([
      {
        order: orders[0],
        dish: dishes[2],
        sellingPrice: 14000,
        discount: '',
        discountType: '',
      },
      {
        order: orders[0],
        dish: dishes[3],
        sellingPrice: 13500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[0],
        product: products[1],
        sellingPrice: 1200,
        discount: '',
        discountType: '',
      },
      {
        order: orders[1],
        dish: dishes[1],
        sellingPrice: 9500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[2],
        dish: dishes[13],
        sellingPrice: 6900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[2],
        product: products[0],
        sellingPrice: 1500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[1],
        dish: dishes[12],
        sellingPrice: 14900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[2],
        dish: dishes[4],
        sellingPrice: 9600,
        discount: '1400',
        discountType: 'FIXED',
      },
      {
        order: orders[3],
        dish: dishes[0],
        sellingPrice: 8900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[3],
        product: products[8],
        sellingPrice: 1600,
        discount: '',
        discountType: '',
      },
      {
        order: orders[4],
        dish: dishes[3],
        sellingPrice: 12150,
        discount: '10',
        discountType: 'PERCENTAGE',
      },
      {
        order: orders[4],
        product: products[3],
        sellingPrice: 1800,
        discount: '',
        discountType: '',
      },
      {
        order: orders[4],
        product: products[4],
        sellingPrice: 2500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[4],
        product: products[5],
        sellingPrice: 900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[5],
        dish: dishes[12],
        sellingPrice: 14900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[5],
        product: products[0],
        sellingPrice: 1500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[6],
        dish: dishes[13],
        sellingPrice: 6900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[6],
        product: products[8],
        sellingPrice: 1600,
        discount: '',
        discountType: '',
      },
      {
        order: orders[6],
        product: products[5],
        sellingPrice: 900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[7],
        dish: dishes[10],
        sellingPrice: 9800,
        discount: '',
        discountType: '',
      },
      {
        order: orders[7],
        product: products[6],
        sellingPrice: 2200,
        discount: '',
        discountType: '',
      },
      {
        order: orders[7],
        product: products[5],
        sellingPrice: 900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[8],
        dish: dishes[8],
        sellingPrice: 7500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[8],
        product: products[5],
        sellingPrice: 900,
        discount: '',
        discountType: '',
      },
      {
        order: orders[9],
        dish: dishes[2],
        sellingPrice: 14000,
        discount: '',
        discountType: '',
      },
      {
        order: orders[9],
        product: products[0],
        sellingPrice: 1500,
        discount: '',
        discountType: '',
      },
      {
        order: orders[9],
        product: products[5],
        sellingPrice: 900,
        discount: '',
        discountType: '',
      },
    ]);
    await orderItemRepo.save(orderItems);
    console.log('Seeded order items.');

    console.log('\nDatabase seeded successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
