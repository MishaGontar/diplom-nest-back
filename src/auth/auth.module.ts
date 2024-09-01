import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "../jwt/jwt.strategy";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma.service";
import { AdminService } from "../admin/admin.service";
import { EmailService } from "../email/email.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "60m" },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    AdminService,
    EmailService,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
