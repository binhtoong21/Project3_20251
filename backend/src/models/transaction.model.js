import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "purchase", "sale_income", "withdrawal"], // Nạp tiền, Mua hàng, Tiền bán sách, Rút tiền
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    // Tham chiếu đến các đối tượng liên quan (Đơn hàng, Sách,...)
    // Giúp truy vết giao dịch dễ dàng hơn. Ví dụ: giao dịch này thuộc đơn hàng nào?
    relatedEntity: {
      id: { type: Schema.Types.ObjectId },
      model: { type: String }, // Ví dụ: 'Order' hoặc 'Book'
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ status: 1 });

const Transaction = model("Transaction", transactionSchema);

export default Transaction;
