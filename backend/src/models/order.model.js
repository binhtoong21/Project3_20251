import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Giá tại thời điểm mua
        cover: { type: String },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // ID người bán. Nếu là null -> sách của cửa hàng
      },
    ],
    shippingAddress: {
      province: { type: String, required: true },
      province_id: { type: Number, default: null },
      district: { type: String, required: true },
      district_id: { type: Number, default: null },
      ward: { type: String, required: true },
      ward_code: { type: String, default: null },
      street: { type: String, required: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shipping: {
        carrier: { type: String, default: 'GHN' },
        service_type_id: { type: Number, default: 2 },
        shipping_fee: { type: Number },
        tracking_code: { type: String },
        ghn_order_code: { type: String },
        expected_delivery_time: { type: Date },
        status: { type: String }
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "COD",
    },
    paymentResult: {
      // Dành cho tích hợp thanh toán online sau này
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    transactionFee: { type: Number, default: 0.0 }, // Fee for C2C wallet transactions
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Completed"],
      default: "Pending",
    },
    escrowStatus: {
      type: String,
      enum: ["Held", "Released", "Refunded", "Disputed", "ReturnRequested", null],
      default: null, // Null for non-wallet orders
    },
    disputeReason: {
      type: String, // Reason provided by buyer when disputing
    },
    disputeEvidence: [{ type: String }], // Array of URLs (images/videos)
    autoConfirmAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
