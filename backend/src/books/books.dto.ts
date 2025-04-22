import {
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber 
} from "class-validator";
import { AvailabilityStatus } from "./books.schema";
import { Type } from "class-transformer";

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  location: string;
  
  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @IsEnum(AvailabilityStatus)
  status: AvailabilityStatus;
}

export class BorrowBookDto {
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class ReserveBookDto {
  @IsDateString()
  reserveStartTime: Date;

  @IsDateString()
  reserveEndTime: Date;
}
