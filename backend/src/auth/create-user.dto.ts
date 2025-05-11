import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  MinLength,
  IsString
} from "class-validator";

export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
  PROFESSOR = "professor",
}

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole, { message: "role must be admin, student, or professor" })
  role: UserRole;

  @IsNotEmpty()
  @IsMobilePhone("en-IN")
  mobile: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipcode: string;
}
