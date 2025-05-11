import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "../users/users.schema";
import { CreateUserDto } from "./create-user.dto";
import { MailService } from "src/mail/mail.service";

interface JwtUserPayload {
  _id: string;
  role: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  zipcode: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService, // <== added MailService here
  ) {}

  async signup(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (existingUser) {
        throw new ConflictException("Email already registered");
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      const user = await createdUser.save();
      await this.mailService.sendWelcomeEmail(user.email, user.name);
      const payload: JwtUserPayload = {
        _id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode
      };
      return this.login(payload);
    } catch (error) {
      console.log("Error:", error);
      throw error; // ✅ re-throw the actual error
    }
  }

  async validateUser(email: string, password: string): Promise<JwtUserPayload> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        _id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode
      };
    }
    throw new UnauthorizedException("Invalid credentials");
  }

  async login(user: JwtUserPayload) {
    try {
      const payload = {
        sub: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      console.log("Error:", error);
    }
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundException("User not found");

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) throw new BadRequestException("Old password is incorrect");

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      return { message: "Password changed successfully" };
    } catch (error) {
      console.error("Error changing password:", error);
      throw new BadRequestException("Failed to change password");
    }
  }

  // === Forgot Password Flow (No Token) ===

  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.mailService.sendPasswordResetEmail(email);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }
}
