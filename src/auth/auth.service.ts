import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async register(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.usersService.createUser(email, hashedPassword);

    const token = await this.generateToken();
    await this.createToken(newUser.id, email, token);

    await this.mailService.queueVerificationEmail(email, token);
    return {
      message:
        'Registration successful, please check your email to verify your account',
    };
  }

  async verifyEmail(token: string) {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { tokenHash: token },
    });
    if (!tokenRecord) {
      throw new NotFoundException('Invalid or expired verification token');
    }
    if (tokenRecord.isUsed || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token has already been used or expired');
    }
    tokenRecord.isUsed = true;
    await this.tokenRepository.save(tokenRecord);

    const user = await this.usersService.findByEmail(tokenRecord.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isVerified = true;
    const updatedUser = await this.usersService.updateUser(user.id, user);
    return { message: 'Email verified successfully', user: updatedUser };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashPassword);
  }

  async generateToken(length: number = 32): Promise<string> {
    const token = randomBytes(length).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    return tokenHash;
  }

  async createToken(
    userId: string,
    email: string,
    token: string,
  ): Promise<Token> {
    const tokenInstance = this.tokenRepository.create({
      userId,
      email,
      tokenHash: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    return this.tokenRepository.save(tokenInstance);
  }
}
