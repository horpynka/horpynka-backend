import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { hashPassword } from 'src/auth/password.util';
import { isAuthRole } from 'src/common/types/auth';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordResponseDto } from './dto/update-user-password-response.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import type { CreateUserData, FindUserCriteria } from './types';

export const USER_EMAIL_TAKEN_MESSAGE = 'Такий імейл вже зайнятий';
export const USER_NOT_FOUND_MESSAGE = 'Користувача не знайдено';

const userResponseFields = {
  id: true,
  email: true,
  roles: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      select: userResponseFields,
      order: { id: 'ASC' },
    });

    return users.map((user) => toUserResponse(user));
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOne(criteria: FindUserCriteria): Promise<User | null> {
    const { email } = criteria;

    if (email) {
      return this.usersRepository.findOne({ where: { email } });
    }

    return null;
  }

  async createNewUser(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create({
      ...data,
      roles: data.roles ?? [],
    });

    return this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException(USER_EMAIL_TAKEN_MESSAGE);
    }

    try {
      const user = await this.createNewUser({
        email: createUserDto.email,
        password: await this.hashPassword(createUserDto.password),
        roles: createUserDto.roles,
      });

      return toUserResponse(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(USER_EMAIL_TAKEN_MESSAGE);
      }

      throw error;
    }
  }

  async updateRoles(
    id: number,
    updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    user.roles = updateUserRolesDto.roles;
    const savedUser = await this.usersRepository.save(user);

    return toUserResponse(savedUser);
  }

  async updatePassword(
    id: number,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<UpdateUserPasswordResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_MESSAGE);
    }

    user.password = await this.hashPassword(updateUserPasswordDto.password);
    await this.usersRepository.save(user);

    return { updated: true };
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds = Number(
      this.configService.get('PASSWORD_HASH_SALT') ?? 10,
    );

    return hashPassword(password, saltRounds);
  }
}

function toUserResponse(
  user: Pick<User, 'id' | 'email' | 'roles'>,
): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    roles: user.roles.filter(isAuthRole),
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;

  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === '23505'
  );
}
