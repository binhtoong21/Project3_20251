/**
 * Kiểm tra số điện thoại Việt Nam
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return regex.test(phone);
};

/**
 * Kiểm tra địa chỉ có điền đủ không
 * @param {object} address
 * @returns {boolean}
 */
export const isValidAddress = (address) => {
  if (!address) return false;
  // Bắt buộc phải có Tỉnh, Huyện, Xã, Đường
  return (
    address.province?.trim().length > 0 &&
    address.district?.trim().length > 0 &&
    address.ward?.trim().length > 0 &&
    address.street?.trim().length > 0
  );
};
