import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";
import {
  EMAIL_CONFIRM_HTML_MSG,
  EMAIL_CONFIRM_SUBJECT_MSG,
  EMAIL_CONG_MSG_HTML,
  EMAIL_REJECT_SELLER_HEADER,
  EMAIL_REJECT_SELLER_HTML,
  EMAIL_SUBJECT_CONGRATULATIONS_SELLER,
} from "./email-text-constants";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>("GMAIL_APP_EMAIL"),
        pass: this.configService.get<string>("GMAIL_APP_PASSWORD"),
      },
    });
  }

  async sendAcceptSellerMessage(email: string): Promise<void> {
    const message = {
      from: this.configService.get<string>("GMAIL_APP_EMAIL"),
      to: email,
      subject: EMAIL_SUBJECT_CONGRATULATIONS_SELLER,
      html: EMAIL_CONG_MSG_HTML,
    };

    await this.transporter.sendMail(message);
  }

  async sendConfirmIdentity(email: string, code: string): Promise<void> {
    const message = {
      from: this.configService.get<string>("GMAIL_APP_EMAIL"),
      to: email,
      subject: `${EMAIL_CONFIRM_SUBJECT_MSG} ${process.env.PRODUCT_NAME}`,
      html: `<p>${EMAIL_CONFIRM_HTML_MSG}<br/><strong>${code}</strong></p>`,
    };

    await this.transporter.sendMail(message);
  }

  async sendRejectSellerMessage(email: string): Promise<void> {
    const message = {
      from: this.configService.get<string>("GMAIL_APP_EMAIL"),
      to: email,
      subject: `${EMAIL_REJECT_SELLER_HEADER} ${process.env.PRODUCT_NAME}`,
      html: EMAIL_REJECT_SELLER_HTML,
    };

    await this.transporter.sendMail(message);
  }
}
