import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BooksModule } from "./books/books.module";
import { DigitalResourcesModule } from "./digital-resources/digital-resources.module";
import { AdminModule } from "./admin/admin.module";
import { MailModule } from "./mail/mail.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: "mongodb+srv://saiteja:Saiteja%402102@cluster0.zdasw.mongodb.net/library-management?retryWrites=true&w=majority",
      }),
      inject: [ConfigService],
    }),
    AdminModule,
    AuthModule,
    UsersModule,
    BooksModule,
    DigitalResourcesModule,
    MailModule,
  ],
})
export class AppModule {}
