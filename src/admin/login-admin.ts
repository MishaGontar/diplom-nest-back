import { IsString, MinLength } from "class-validator";

export class LoginAdmin {
  @IsString()
  @MinLength(3)
  login: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @MinLength(4)
  security_code: string;
}
