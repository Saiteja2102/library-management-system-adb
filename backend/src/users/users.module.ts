import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User, UserSchema } from "./users.schema";
import { BooksModule } from "src/books/books.module";
import { DigitalResourcesModule } from "src/digital-resources/digital-resources.module";
import { StatusCheckModule } from "src/status-handler/status-handler.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BooksModule,
    DigitalResourcesModule,
    StatusCheckModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
