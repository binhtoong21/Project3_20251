import nodemailer from "nodemailer";

// Cấu hình transporter email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Gửi email xác thực
export const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "📚 Xác thực Email - BookStore",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Chào mừng bạn đến với BookStore!</h2>
        <p style="color: #666;">Vui lòng xác thực email của bạn để hoàn tất đăng ký.</p>
        
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="
            display: inline-block;
            padding: 12px 30px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">Xác thực Email</a>
        </div>
        
        <p style="color: #999; font-size: 14px;">
          Hoặc sao chép đường link này: <br>
          ${verificationUrl}
        </p>
        
        <p style="color: #999; font-size: 14px;">
          Link này sẽ hết hạn sau 24 giờ.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email xác thực đã được gửi" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Không thể gửi email xác thực");
  }
};

// Gửi email reset password
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔑 Đặt Lại Mật Khẩu - BookStore",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Đặt Lại Mật Khẩu</h2>
        <p style="color: #666;">Bạn yêu cầu đặt lại mật khẩu cho tài khoản BookStore của bạn.</p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            padding: 12px 30px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">Đặt Lại Mật Khẩu</a>
        </div>
        
        <p style="color: #999; font-size: 14px;">
          Hoặc sao chép đường link này: <br>
          ${resetUrl}
        </p>
        
        <p style="color: #999; font-size: 14px;">
          Link này sẽ hết hạn sau 1 giờ.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Nếu bạn không yêu cầu này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email đặt lại mật khẩu đã được gửi" };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu");
  }
};

export default transporter;
