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
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AUTH_ROLES } from 'src/common/types/auth';
import { Roles } from 'src/common/decorators/roles.decorator';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConflictResponse({ description: 'Товар ще використовується' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
