// src/shared/utils/formatters.js

/**
 * Định dạng một số thành chuỗi tiền tệ VND
 * @param {number} price - Giá tiền (VND)
 * @returns {string} - Chuỗi đã định dạng, ví dụ: "205.000 ₫"
 */
export function formatPrice(price) {
  if (typeof price !== "number") {
    return ""; // Hoặc trả về một giá trị mặc định
  }
  return `${price.toLocaleString('vi-VN')} ₫`;
}
