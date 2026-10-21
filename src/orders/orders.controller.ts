import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Defaults to 1',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Defaults to 10',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Defaults to CREATED',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Receipt number or status substring',
    example: '12',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Inclusive start date in Europe/Kyiv (YYYY-MM-DD)',
    example: '2026-10-11',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'Inclusive end date in Europe/Kyiv (YYYY-MM-DD)',
    example: '2026-10-17',
  })
  findAll(@Query() query: FindOrdersQueryDto): Promise<Order[]> {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch('/remove-active-receipt/:id')
  removeActiveReceipt(@Param('id') id: number): Promise<Order> {
    return this.ordersService.removeActiveReceipt(id);
  }
}
