import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter with Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send OTP email for registration
   */
  async sendRegistrationOTP(
    email: string,
    otp: string,
    name: string,
  ): Promise<void> {
    const subject = "Xác thực tài khoản - Mã OTP của bạn";
    const text = `Xin chào ${name},\n\nMã OTP của bạn là: ${otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nNếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xác thực tài khoản</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất đăng ký, vui lòng sử dụng mã OTP bên dưới:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666;">Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
        <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Send OTP email for password reset
   */
  async sendPasswordResetOTP(
    email: string,
    otp: string,
    name: string,
  ): Promise<void> {
    const subject = "Đặt lại mật khẩu - Mã OTP của bạn";
    const text = `Xin chào ${name},\n\nMã OTP để đặt lại mật khẩu của bạn là: ${otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP bên dưới:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #FF5722; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666;">Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
        <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và tài khoản của bạn vẫn an toàn.</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Generic send email method
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // If email credentials are not configured, log to console instead
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log("\n========================================");
        console.log("📧 EMAIL SERVICE (DEVELOPMENT MODE)");
        console.log("========================================");
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content:\n${options.text}`);
        console.log("========================================\n");
        return;
      }

      // Send actual email
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || "BE_BTVN"}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
    } catch (error: any) {
      console.error("❌ Error sending email:", error.message);
      // In development, don't throw error - just log it
      if (process.env.NODE_ENV === "production") {
        throw new Error("Failed to send email");
      }
      // Rethrow in dev too so the API returns an error instead of success
      throw error;
    }
  }

  /**
   * Verify email service connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(
          "⚠️  Email service running in DEVELOPMENT MODE (console logging only)",
        );
        return true;
      }

      await this.transporter.verify();
      console.log("✅ Email service connected successfully");
      return true;
    } catch (error: any) {
      console.error("❌ Email service connection failed:", error.message);
      return false;
    }
  }
}

// Export singleton instance
export default new EmailService();
