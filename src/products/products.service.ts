import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { OrderItem } from '../orders/entities/order-item.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

const PRODUCT_IN_USE_MESSAGE = 'Товар ще використовується';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findOne(
      createProductDto.categoryId,
    );
    const today = new Date();
    const product = this.productsRepository.create({
      name: createProductDto.name,
      ownPrice: createProductDto.ownPrice,
      sellingPrice: createProductDto.sellingPrice,
      measurementUnit: createProductDto.measurementUnit,
      selling: createProductDto.selling ?? true,
      category,
      createdAt: today,
      updatedAt: today,
    });
    const saved = await this.productsRepository.save(product);

    return this.findOne(saved.id);
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: {
        category: true,
      },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const category = await this.categoriesService.findOne(
      updateProductDto.categoryId,
    );

    product.name = updateProductDto.name;
    product.ownPrice = updateProductDto.ownPrice;
    product.sellingPrice = updateProductDto.sellingPrice;
    product.measurementUnit = updateProductDto.measurementUnit;
    product.selling = updateProductDto.selling ?? true;
    product.category = category;
    product.updatedAt = new Date();

    await this.productsRepository.save(product);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const inUse = await this.orderItemsRepository.exists({
      where: { productId: id },
    });

    if (inUse) {
      throw new ConflictException(PRODUCT_IN_USE_MESSAGE);
    }

    try {
      await this.productsRepository.delete(id);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(PRODUCT_IN_USE_MESSAGE);
      }

      throw error;
    }
  }
}

function isForeignKeyViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;

  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === '23503'
  );
}
