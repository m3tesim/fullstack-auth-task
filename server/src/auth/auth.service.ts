import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User, UserDocument } from './schemas/user.schema';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.userModel.exists({ email });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const created = await this.userModel.create({
      name: dto.name.trim(),
      email,
      password: hashedPassword,
    });

    return this.buildAuthResponse(created);
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }
    return this.toAuthUser(user);
  }

  private buildAuthResponse(user: UserDocument): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id as string,
      email: user.email,
    };

    const expiresIn = (this.configService.get<string>('JWT_EXPIRES_IN') ??
      '1d') as JwtSignOptions['expiresIn'];
    const signOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn,
    };
    const accessToken = this.jwtService.sign(payload, signOptions);

    return {
      accessToken,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: UserDocument): AuthUser {
    return {
      id: user.id as string,
      name: user.name,
      email: user.email,
    };
  }
}
