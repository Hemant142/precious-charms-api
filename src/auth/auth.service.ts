import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.ensureDemoAdmin();
  }

  /** Creates the demo admin used by the React admin panel if missing. */
  async ensureDemoAdmin() {
    const email = process.env.ADMIN_EMAIL || 'admin123@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const name = process.env.ADMIN_NAME || 'Admin';

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        this.logger.log(`Promoted ${email} to admin role`);
      } else {
        this.logger.log(`Demo admin already exists: ${email}`);
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });
    this.logger.log(
      `Seeded demo admin ${email} (login with this account to get a JWT for /users and product CRUD)`,
    );
  }

  async register(dto: RegisterDto) {
    const userExists = await this.userModel.findOne({ email: dto.email });

    if (userExists) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      ...dto,
      password: hashedPassword,
      role: 'user',
    });

    const token = this.signToken(user);

    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(user);

    return {
      accessToken: token,
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  private signToken(user: User & { _id: { toString(): string } }) {
    return this.jwtService.sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }

  private sanitizeUser(user: User & { _id: { toString(): string } }) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
