export function formatPrice(price) {
  if (typeof price !== "number") {
    return "";
  }
  return `${price.toLocaleString("vi-VN")} ₫`;
}

export function formatDate(dateString) {
  if (!dateString) return "Invalid Date";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
