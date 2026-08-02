import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from 'src/users/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

   async register(dto: RegisterDto) {
    const userExists =
      await this.userModel.findOne({
        email: dto.email,
      });

    if (userExists) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(dto.password, 10);

    const user =
      await this.userModel.create({
        ...dto,
        password: hashedPassword,
      });

    return user;
  }

  async login(dto: LoginDto) {
    const user =
      await this.userModel.findOne({
        email: dto.email,
      });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const match =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!match) {
      throw new BadRequestException('Invalid credentials');
    }

    const token =
      this.jwtService.sign({
        userId: user._id,
      });

    return {
      accessToken: token,
    };
  }
}
