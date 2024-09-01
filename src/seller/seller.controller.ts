import {
  Controller,
  Get,
  InternalServerErrorException,
  UseGuards,
} from "@nestjs/common";
import { SellerService } from "./seller.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../role/role.guard";
import { Roles } from "../role/roles";

@Controller("seller")
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  async getSellers() {
    try {
      const sellers = await this.sellerService.getAllSellers();
      return { sellers };
    } catch (e) {
      console.error("Error during getSellers:", e);
      throw new InternalServerErrorException("Internal Server Error");
    }
  }
}
