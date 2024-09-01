import { Module } from "@nestjs/common";
import { AuctionService } from "./auction.service";
import { AuctionController } from "./auction.controller";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [AuctionController],
  providers: [AuctionService, PrismaService],
})
export class AuctionModule {}
