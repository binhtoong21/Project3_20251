import rateLimit from "express-rate-limit";

// Limit cho đăng nhập và đăng ký (tránh brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // tối đa 20 request
  message: {
    message: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Limit cho việc gửi email (quên mật khẩu, gửi lại verify email) - tránh spam mail
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // tối đa 10 request mỗi giờ
  message: {
    message: "Bạn đã yêu cầu gửi email quá nhiều lần. Vui lòng thử lại sau 1 giờ.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
