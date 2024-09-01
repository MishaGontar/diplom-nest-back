import {
  BadRequestException,
  Injectable,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateAuctionDto } from "./create-auction.dto";
import {
  IAuction,
  IAuctionData,
  selectFullAuctionInformation,
} from "./IAuction";
import { auction_status } from "@prisma/client";

@Injectable()
export class AuctionService {
  constructor(private readonly prisma: PrismaService) {}

  @UsePipes(new ValidationPipe())
  async createAuction(formData: CreateAuctionDto): Promise<IAuction> {
    const auction: IAuctionData = await this.prisma.auctions.create({
      data: { ...formData },
      select: selectFullAuctionInformation,
    });

    if (!auction) {
      throw new BadRequestException("Не вдалося створити аукціон");
    }

    return this.transformAuctionData(auction);
  }

  async getAuctionsBySellerId(sellerId: number): Promise<IAuction[]> {
    const auction: IAuctionData[] = await this.prisma.auctions.findMany({
      where: { seller_id: sellerId },
      select: selectFullAuctionInformation,
      orderBy: {
        date_created: "desc",
      },
    });
    return auction.map(this.transformAuctionData);
  }

  async getAuctionById(id: number): Promise<IAuction | null> {
    const auction: IAuctionData = await this.prisma.auctions.findUnique({
      where: { id },
      select: selectFullAuctionInformation,
    });
    return auction ? this.transformAuctionData(auction) : null;
  }

  async getAllAuctions(): Promise<IAuction[]> {
    const auctions: IAuctionData[] = await this.prisma.auctions.findMany({
      select: selectFullAuctionInformation,
    });
    return auctions.map(this.transformAuctionData);
  }

  async getAuctionStatus(): Promise<auction_status[]> {
    return this.prisma.auction_status.findMany({
      where: {
        name: {
          not: "продано",
        },
      },
    });
  }

  async getOnlyCreateAuctionStatus(): Promise<auction_status[]> {
    return this.prisma.auction_status.findMany({
      where: {
        name: {
          notIn: ["продано", "завершений"],
        },
      },
    });
  }

  private transformAuctionData(auction: IAuctionData): IAuction {
    const { sellers, ...rest } = auction;

    return {
      ...rest,
      sellers: {
        id: sellers.id,
        full_name: sellers.full_name,
        image_url: sellers.users.images?.image_url || null,
      },
    };
  }
}
