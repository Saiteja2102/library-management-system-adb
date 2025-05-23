import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { UserDocument } from "src/users/users.schema";

export type BookDocument = Book & Document;

export enum AvailabilityStatus {
  Available = "available",
  Borrowed = "borrowed",
  Reserved = "reserved",
  Lost = "lost",
  ReturnRequested = "return_requested",
}

@Schema()
export class Book {
  @Prop({ required: true })
  copyId: string;

  @Prop({ required: true })
  bookId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  isbn: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  publishedYear: string;

  @Prop({ required: true })
  numOfPages: number;

  // @Prop({ required: true })
  // image: number;

  @Prop({ enum: AvailabilityStatus, required: true })
  status: AvailabilityStatus;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  borrowedBy: Types.ObjectId | null;

  // Changed from an array to a single reservedBy
  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  reservedBy: Types.ObjectId | UserDocument;

  // New reservation time fields
  @Prop({ type: Date, default: null })
  startTime: Date | null;

  @Prop({ type: Date, default: null })
  endTime: Date | null;

  @Prop({ type: Date, default: null })
  reserveStartTime: Date | null;

  @Prop({ type: Date, default: null })
  reserveEndTime: Date | null;

  @Prop({ required: true })
  cost: number;

  @Prop({ type: Boolean, default: false })
  isRenewed: boolean;
}

export const BookSchema = SchemaFactory.createForClass(Book);
