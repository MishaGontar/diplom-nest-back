import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import { PrismaService } from "../prisma.service";
import { images } from "@prisma/client";

@Injectable()
export class ImageService {
  constructor(private readonly prisma: PrismaService) {}

  async createImageLot(
    files: Express.Multer.File[],
    lot_id: number,
  ): Promise<boolean> {
    for (const file of files) {
      const img_db = await this.createImage(file);
      if (!img_db) {
        throw new BadRequestException("Не вдалося створити зображення");
      }

      await this.prisma.lot_images.create({
        data: {
          lot_id,
          img_id: img_db.id,
        },
      });
    }
    return true;
  }

  async createImage(file: Express.Multer.File): Promise<images> {
    const { filename } = file;
    const url = `/images/${filename}`;
    const fileBytes = fs.readFileSync(file.path);

    return this.prisma.images.create({
      data: {
        name: filename,
        image_url: url,
        photo_data: fileBytes,
      },
    });
  }

  async deleteImageByUrl(url: string): Promise<void> {
    const image = await this.prisma.images.delete({
      where: {
        image_url: url,
      },
    });

    if (!image) {
      console.warn(`Не вдалося видалити зображення за URL: ${url}`);
      return;
    }

    await this.deleteImageByFileName(image.name);
    console.log(`Успішно видалено за URL: ${url}`);
  }

  async deleteImageById(id: number): Promise<void> {
    const image = await this.prisma.images.delete({
      where: {
        id: id,
      },
    });

    if (!image) {
      console.warn(`Не вдалося видалити зображення за ID: ${id}`);
      return;
    }

    await this.deleteImageByFileName(image.name);
    console.log(`Успішно видалено за ID: ${id}`);
  }

  async deleteImageByFileName(filename: string): Promise<void> {
    const imagePath = await this.getImageUploadPath(filename);
    this.deleteFileByPath(imagePath);
  }

  async getImageUploadPath(filename: string): Promise<string> {
    return this.getImagePath(filename, "./images");
  }

  async getImageBytes(
    filename: string,
  ): Promise<{ image_url: string; photo_data: Buffer }> {
    const image = await this.prisma.images.findFirst({
      where: {
        name: filename,
      },
    });

    if (!image) {
      throw new NotFoundException("Не вдалося знайти зображення");
    }

    return {
      image_url: image.image_url,
      photo_data: image.photo_data,
    };
  }

  async getImagePath(filename: string, fileDir: string): Promise<string> {
    const imagePath = path.resolve(fileDir, filename);
    try {
      await fs.promises.access(imagePath, fs.constants.F_OK);
      console.log(`Файл існує: ${imagePath}`);
      return imagePath;
    } catch (err: any) {
      console.warn(err);
      throw new NotFoundException(`Не знайдено файл за шляхом ${imagePath}`);
    }
  }

  async deleteImagesByLotId(lotId: number): Promise<void> {
    const images = await this.prisma.lot_images.findMany({
      where: { lot_id: lotId },
      include: { images: true },
    });

    if (!images.length) {
      console.warn(`Не вдалося видалити зображення лота ${lotId}`);
      return;
    }

    for (const image of images) {
      await this.deleteImageById(image.id);
    }
  }

  deleteFileByPath(filepath: string): void {
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error("Can`t delete file:", err);
      } else {
        console.log("File delete success:", filepath);
      }
    });
  }
}
