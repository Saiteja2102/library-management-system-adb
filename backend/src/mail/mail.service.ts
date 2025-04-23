/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "saitejabatraju@gmail.com",
      pass: "qvxl ekvq dxjf krfg",
    },
  });

  async sendBookLostRefundEmail(
    email: string,
    bookTitle: string,
    refundAmount: number,
  ) {
    const mailOptions = {
      to: email,
      subject: "Book Reservation Refund",
      html: `
        <p>Hello,</p>
        <p>We regret to inform you that the book <strong>${bookTitle}</strong> which you had reserved is no longer available as it was marked lost by the borrower.</p>
        <p>A refund of <strong>$${refundAmount}</strong> is being processed to your account.</p>
        <p>Thank you for your understanding.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string) {
    const resetLink = `http://localhost:3000/forgot_password?email=${encodeURIComponent(email)}`;

    const mailOptions = {
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password.</p>
        <p>Please click the link below to set a new password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, name: string) {
    const mailOptions = {
      to: email,
      subject: "🎉 Welcome to the Library Management System!",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Hi ${name},</h2>
          <p>Welcome to our Library Management System!!!</p>
          <img 
            src="https://raw.githubusercontent.com/Saiteja2102/library-management-system-adb/refs/heads/main/welcome.gif" 
            alt="Welcome" 
            style="max-width: 100%; border-radius: 10px; margin: 20px 0;"
          />
          <p>Explore a wide collection of books and digital resources now available to you.</p>
          <p>Happy Reading! 📚</p>
          <p style="margin-top: 20px;">– Library Management Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
