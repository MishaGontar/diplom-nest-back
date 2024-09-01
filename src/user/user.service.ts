import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateUserDto } from "./create-user.dto";
import { blocked_users, users } from "@prisma/client";
import { LoginUser } from "./login-user";
import { AuthService } from "../auth/auth.service";
import { Role } from "../role/roles";
import * as cron from "node-cron";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { IUser } from "./IUser";

const settings = {
  id: true,
  username: true,
  email: true,
  is_activated: true,
  images: {
    select: {
      image_url: true,
    },
  },
  sellers: {
    select: {
      id: true,
    },
  },
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async findAllUsersWithoutAdmins(): Promise<IUser[]> {
    const adminUserIds = (
      await this.prisma.admins.findMany({
        select: {
          user_id: true,
        },
      })
    ).map((admin) => admin.user_id);

    return this.prisma.users.findMany({
      where: {
        id: { notIn: adminUserIds },
      },
      select: settings,
    });
  }

  findOneById(id: number): Promise<IUser> {
    return this.prisma.users.findUnique({ where: { id }, select: settings });
  }

  findOneByUsernameOrEmail(usernameOrEmail: string): Promise<users> {
    return this.prisma.users.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
  }

  create(dto: CreateUserDto): Promise<users> {
    return this.prisma.users.create({ data: dto });
  }

  async login(loginUser: LoginUser): Promise<{ token: string }> {
    const user: users = await this.findOneByUsernameOrEmail(
      loginUser.username || loginUser.email,
    );
    await this.authService.validateUser(user, loginUser.password);
    await this.authService.sendMfaCode(user);
    return this.authService.generateToken({ id: user.id, role: Role.USER });
  }

  async registration(loginUser: CreateUserDto): Promise<{ token: string }> {
    const user: users = await this.prisma.users.findFirst({
      where: {
        OR: [{ username: loginUser.username }, { email: loginUser.email }],
      },
    });
    if (user) {
      throw new BadRequestException("Користувач вже зареєстрований");
    }
    const hashPassword = await bcrypt.hash(
      loginUser.password,
      +this.configService.get("AUTH_SALT_ROUND"),
    );
    const newUser: users = await this.prisma.users.create({
      data: {
        username: loginUser.username,
        password: hashPassword,
        email: loginUser.email,
      },
    });
    cron.schedule(
      "*/10 * * * *",
      async () => await this.deleteUserByIdIfNotActivated(newUser.id),
    );
    await this.authService.sendMfaCode(newUser);
    return this.authService.generateToken({ id: newUser.id, role: Role.USER });
  }

  activateAccount(userId: number): Promise<users> {
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        is_activated: true,
      },
    });
  }

  deleteUserByIdIfNotActivated(userId: number): Promise<users> {
    return this.prisma.users.delete({
      where: { id: userId, is_activated: false },
    });
  }

  blockUserById(userId: number): Promise<blocked_users> {
    return this.prisma.blocked_users.create({
      data: {
        user_id: userId,
      },
    });
  }

  unblockUserById(userId: number): Promise<blocked_users> {
    return this.prisma.blocked_users.delete({
      where: {
        id: userId,
      },
    });
  }

  async getAllBlockedUsers() {
    return this.prisma.users.findMany({
      where: {
        blocked_users: { some: {} },
      },
      select: {
        id: true,
        username: true,
        email: true,
        is_activated: true,
        images: {
          select: {
            image_url: true,
          },
        },
      },
    });
  }
}
