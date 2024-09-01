import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "../prisma.service";
import { AuthModule } from "../auth/auth.module";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UserService, PrismaService, ConfigService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
