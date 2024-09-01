import {
  Body,
  Controller,
  HttpException,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginUser } from "../user/login-user";
import { UserService } from "../user/user.service";
import { LoginAdmin } from "../admin/login-admin";
import { AdminService } from "../admin/admin.service";
import { RolesGuard } from "../role/role.guard";
import { AuthGuard } from "@nestjs/passport";
import { CreateUserDto } from "../user/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}

  @Post("login")
  @UsePipes(new ValidationPipe())
  async login(@Body() user: LoginUser) {
    return await this.userService.login(user);
  }

  @Post("admin/login")
  @UsePipes(new ValidationPipe())
  async loginAdmin(@Body() user: LoginAdmin) {
    return await this.adminService.login(user);
  }

  @Post("registration")
  @UsePipes(new ValidationPipe())
  async registration(@Body() user: CreateUserDto) {
    return await this.userService.registration(user);
  }

  @Post("mfa")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  async mfa(@Request() req, @Body() mfa: { code: string }) {
    const user = req.user;
    const isValidCode = await this.authService.validateMfaCode(
      mfa.code,
      user.id,
    );
    if (!isValidCode) {
      throw new HttpException("Неправильний код безпеки", 400);
    }
    return await this.authService.generateAuthTokenByUserId(user.id, user.role);
  }
}
