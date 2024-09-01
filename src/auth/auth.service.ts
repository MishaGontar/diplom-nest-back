import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import { blocked_users, users } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { EmailService } from "../email/email.service";
import * as cron from "node-cron";
import { UserService } from "../user/user.service";
import { Role } from '../role/roles';

export interface UserAuthData {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  generateToken(payload: any) {
    return {
      token: this.jwtService.sign(payload),
    };
  }

  async generateAuthTokenByUserId(userId: number, role: string) {
    if(role === Role.SELLER){
      throw new ForbiddenException("Доступ заборонено");
    }
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new BadRequestException("Користувача не знайдено");
    }
    if (!user.is_activated) {
      await this.userService.activateAccount(userId);
    }
    const payload = {
      ...user,
      role: role,
    };
    return this.generateToken(payload);
  }

  async sendMfaCode(user: any) {
    const code = this.generateRandomString(12);
    const createdCode = await this.prisma.users_codes.create({
      data: { code: code, user_id: user.id },
    });
    await this.emailService.sendConfirmIdentity(user.email, code);

    cron.schedule(
      "*/10 * * * *",
      async () => await this.deleteCodeById(createdCode.id),
    );
  }

  async validateMfaCode(mfaCode: string, userId: number): Promise<boolean> {
    const code = await this.prisma.users_codes.findFirst({
      where: { code: mfaCode, user_id: userId },
    });
    if (!code) {
      return false;
    }
    await this.deleteCodeById(code.id);
    return true;
  }

  async validateUser(user: users, password?: string): Promise<void> {
    if (!user) {
      throw new BadRequestException("Невірний логін або пароль.");
    }
    const isBlockedUser: blocked_users = await this.isBlockedUser(user);
    if (isBlockedUser) {
      throw new ForbiddenException("Ви заблоковані");
    }
    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) {
      throw new BadRequestException("Невірний логін або пароль.");
    }
  }

  isBlockedUser(user: users): Promise<blocked_users> {
    return this.prisma.blocked_users.findFirst({
      where: {
        user_id: user.id,
      },
    });
  }

  async deleteCodeById(id: number): Promise<void> {
    const codeExists = await this.prisma.users_codes.findUnique({
      where: { id: id },
    });

    if (codeExists) {
      await this.prisma.users_codes.delete({
        where: { id: id },
      });
    }
  }

  private generateRandomString(minLength: number): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";

    while (randomString.length < minLength) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }
}
