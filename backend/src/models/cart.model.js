import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    cover: { type: String },
  },
  {
    _id: true,
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

cartSchema.virtual("totalQuantity").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;