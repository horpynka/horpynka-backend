import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AUTH_ROLES } from 'src/common/types/auth';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordResponseDto } from './dto/update-user-password-response.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  USER_EMAIL_TAKEN_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
  UsersService,
} from './users.service';

@Roles(AUTH_ROLES.HORPYNKA_PANEL_ADMIN)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: USER_EMAIL_TAKEN_MESSAGE })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id/roles')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: USER_NOT_FOUND_MESSAGE })
  updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateRoles(id, updateUserRolesDto);
  }

  @Patch(':id/password')
  @ApiOkResponse({ type: UpdateUserPasswordResponseDto })
  @ApiNotFoundResponse({ description: USER_NOT_FOUND_MESSAGE })
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<UpdateUserPasswordResponseDto> {
    return this.usersService.updatePassword(id, updateUserPasswordDto);
  }
}
