import { IsNumber, IsString } from "class-validator";

export class CreateAuctionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  seller_id: number;

  @IsNumber()
  status_id: number;

  @IsNumber()
  img_id: number;
}
