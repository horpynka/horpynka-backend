import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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
}
