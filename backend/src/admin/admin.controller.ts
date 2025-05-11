import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  BadRequestException,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateBookDto } from "src/books/books.dto";
import { CreateDigitalResourceDto } from "src/digital-resources/digital-resources.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("user-activity")
  async getUserActivity() {
    return await this.adminService.getUserActivity();
  }

  @Post("create-book")
  async createBook(@Body() data: CreateBookDto) {
    try {
      return await this.adminService.createBook(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Put("update-book/:id")
  updateBook(@Param("id") id: string, @Body() body: CreateBookDto) {
    return this.adminService.updateBook(id, body);
  }

  @Delete("books/:id")
  deleteBook(@Param("id") id: string) {
    return this.adminService.deleteBook(id);
  }

  @Post("digital-resources")
  async createDigital(@Body() data: CreateDigitalResourceDto) {
    try {
      return await this.adminService.createDigitalResource(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Put("digital-resources/:id")
  updateDigital(
    @Param("id") id: string,
    @Body() body: Partial<CreateDigitalResourceDto>,
  ) {
    return this.adminService.updateDigitalResource(id, body);
  }

  @Delete("digital-resources/:id")
  deleteDigital(@Param("id") id: string) {
    return this.adminService.deleteDigitalResource(id);
  }

  @Get("books")
  getBooks() {
    return this.adminService.getAllBooks();
  }

  @Get("resources")
  getDigitalResources() {
    return this.adminService.getAllDigitalResources();
  }

  @Patch("books/:id/add-copy")
  addBookCopy(@Param("id") id: string, @Body("location") location: string) {
    return this.adminService.addBookCopy(id, location);
  }
}
