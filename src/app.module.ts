import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { SellerModule } from "./seller/seller.module";
import { AuctionModule } from './auction/auction.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [ConfigModule.forRoot(), UserModule, AuthModule, SellerModule, AuctionModule, ImageModule],
})
export class AppModule {}
