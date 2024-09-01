import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// Кастомний валідатор для перевірки, що або username, або email присутній
@ValidatorConstraint({ name: "isUsernameOrEmail", async: false })
export class IsUsernameOrEmailConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as LoginUser;
    return !!object.username || !!object.email;
  }

  defaultMessage() {
    return "Потрібно вказати логін або пошту.";
  }
}

export class LoginUser {
  @ApiPropertyOptional({
    description: "Логін користувача, мінімальна довжина 3 символи",
    minLength: 3,
    maxLength: 255,
    example: "username123",
  })
  @IsOptional()
  @IsString({ message: "логін має бути рядком" })
  @MinLength(3, {
    message: "логін має бути не коротшим за 3 символи",
  })
  @MaxLength(255, {
    message: "логін має бути не довшим за 255 символів",
  })
  username: string;

  @ApiPropertyOptional({
    description: "Електронна пошта користувача",
    maxLength: 255,
    example: "user@example.com",
  })
  @IsOptional()
  @IsEmail({}, { message: "Невірний формат пошти" })
  @MaxLength(255, {
    message: "пошта має бути не довшою за 255 символів",
  })
  email: string;

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
    description: "Перевірка, що логін або пошта присутні",
  })
  @Validate(IsUsernameOrEmailConstraint)
  validateUsernameOrEmail: unknown;
}
