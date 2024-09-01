import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { Response } from "express";
import * as fs from "fs";
import { promisify } from "util";
import { ImageService } from "./image.service";

const access = promisify(fs.access);

@Controller("images")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(":filename")
  async getUploadImage(
    @Param("filename") filename: string,
    @Res() res: Response,
  ) {
    try {
      try {
        const imagePath = await this.imageService.getImageUploadPath(filename);
        await access(imagePath, fs.constants.F_OK);
        return res.sendFile(imagePath);
      } catch (err: any) {
        console.warn("Спробуємо отримати байти", err);

        const photo = await this.imageService.getImageBytes(filename);
        const split_img = photo.image_url.split(".");
        const extension = split_img[split_img.length - 1].toLowerCase();

        const type = extension === "jpg" ? "jpeg" : extension;
        res.writeHead(200, { "Content-Type": `image/${type}` });
        res.end(photo.photo_data);
      }
    } catch (e) {
      console.error(e);
      throw new NotFoundException(e.message || "File not found");
    }
  }
}
