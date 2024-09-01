import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from "@nestjs/common";
import { AuctionService } from "./auction.service";
import { IAuction } from "./IAuction";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../role/role.guard";
import { Role, Roles } from "../role/roles";

@Controller("auction")
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get("info/:id")
  @HttpCode(200)
  async getAuctionInfo(@Param("id") id: number) {
    const auction = await this.auctionService.getAuctionById(+id);
    if (!auction) {
      throw new BadRequestException("Такого аукціону не існує");
    }
    return auction;
  }

  @Get("all")
  @HttpCode(200)
  async getAllAvailableAuction() {
    const auctions: IAuction[] = await this.auctionService.getAllAuctions();
    const filteredAuctions = auctions.filter(
      (auction) =>
        auction.auction_status.id === 1 || auction.auction_status.id === 5,
    );
    return {
      auctions: filteredAuctions,
    };
  }

  @Get("status")
  @HttpCode(200)
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.SELLER)
  async getAuctionStatus() {
    const status = await this.auctionService.getAuctionStatus();
    return { status };
  }

  @Get("create_statuses")
  @HttpCode(200)
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles(Role.SELLER)
  async getCreateStatus() {
    const status = await this.auctionService.getOnlyCreateAuctionStatus();
    return { status };
  }
}
