import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { randomBytes } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { UserResponse } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(email: string, passwordHash: string): Promise<UserResponse> {
    const referralCode = await this.generateReferralCode();

    const user = this.userRepository.create({
      email,
      passwordHash,
      referralCode,
    });
    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponse, savedUser);
  }

  async updateUser(id: string, user: Partial<User>): Promise<UserResponse> {
    await this.userRepository.update(id, user);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return plainToInstance(UserResponse, updatedUser);
  }

  async generateReferralCode(): Promise<string> {
    const referralCode = randomBytes(4).toString('hex');
    const existingUser = await this.userRepository.findOne({
      where: { referralCode },
    });
    if (existingUser) {
      return this.generateReferralCode();
    }
    return referralCode;
  }
}
