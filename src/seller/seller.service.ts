import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  findSellerByUserId(userId: number) {
    return this.prisma.sellers.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        full_name: true,
        address: true,
        description: true,
        phone_number: true,
        social_media: true,
        seller_status: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          select: {
            username: true,
            email: true,
            images: {
              select: {
                image_url: true,
              },
            },
          },
        },
      },
    });
  }
}
