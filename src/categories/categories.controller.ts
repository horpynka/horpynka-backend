import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { FindAllResponse } from './types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';

@Roles(AUTH_ROLES.HORPYNKA_CASHIER_USER, AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<FindAllResponse> {
    return this.categoriesService.findAll();
  }
}
