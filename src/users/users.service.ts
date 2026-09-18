import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserData, FindUserCriteria } from './types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
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
}
