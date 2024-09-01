import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "Ім'я користувача користувача",
    minLength: 3,
    maxLength: 255,
    example: "username123",
  })
  @IsString({ message: "Ім'я користувача має бути рядком" })
  @MinLength(3, {
    message: "Ім'я користувача має бути не коротшим за 3 символи",
  })
  @MaxLength(255, {
    message: "Ім'я користувача має бути не довшим за 255 символів",
  })
  username: string;

  @ApiProperty({
    description: "Пароль користувача",
    minLength: 4,
    maxLength: 255,
    example: "password123",
  })
  @IsString({ message: "пароль має бути рядком" })
  @MinLength(4, {
    message: "пароль має бути не коротшим за 4 символи",
  })
  @MaxLength(255, {
    message: "пароль має бути не довшим за 255 символів",
  })
  password: string;

  @ApiProperty({
    description: "Електронна пошта користувача",
    maxLength: 255,
    example: "user@example.com",
  })
  @IsEmail({}, { message: "Невірний формат пошти" })
  @MaxLength(255, {
    message: "пошта має бути не довшою за 255 символів",
  })
  email: string;

  @ApiPropertyOptional({
    description: "ID зображення профілю користувача",
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  image_id?: number;

  @ApiPropertyOptional({
    description: "Стан активації користувача",
    type: Boolean,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  is_activated?: boolean;
}

export type TUserUpdateDto = Partial<CreateUserDto>;
