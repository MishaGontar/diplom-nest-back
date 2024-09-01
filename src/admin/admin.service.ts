import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { LoginAdmin } from "./login-admin";
import * as bcrypt from "bcrypt";
import { admins } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { Role } from "../role/roles";
import { UserService } from "../user/user.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async login(user: LoginAdmin) {
    const admin: admins = await this.prismaService.admins.findFirst({
      where: {
        login: user.login,
      },
    });
    if (!admin) {
      throw new BadRequestException("Неправильний логін або пароль.");
    }

    const isMatchPassword = await bcrypt.compare(user.password, admin.password);
    if (!isMatchPassword) {
      throw new BadRequestException("Неправильний логін або пароль.");
    }

    const isMatchSecureCode = await bcrypt.compare(
      user.security_code,
      admin.secure_code,
    );

    if (!isMatchSecureCode) {
      throw new BadRequestException("Неправильний код безпеки");
    }
    const userFromDb = await this.userService.findOneById(admin.user_id);

    if (!userFromDb) {
      throw new BadRequestException("Користувача не знайдено");
    }

    await this.authService.sendMfaCode(userFromDb);
    return this.authService.generateToken({
      id: userFromDb.id,
      role: Role.ADMIN,
    });
  }
}
