import mongoose from 'mongoose';

// Schema cho từng sản phẩm trong giỏ hàng
const cartItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true, min: 1 },
    // Lưu lại các thông tin sách để không bị ảnh hưởng nếu sách gốc bị thay đổi
    price: { type: Number, required: true },
    title: { type: String, required: true },
    cover: { type: String },
  },
  {
    _id: true, // Mỗi item trong giỏ hàng sẽ có _id riêng
  }
);

// Schema cho giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    // Dùng để xác định giỏ hàng, ví dụ: theo session hoặc user ID.
    // Vì chưa có người dùng, ta có thể dùng một giá trị mặc định.
    sessionId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property để tính tổng số lượng sản phẩm
cartSchema.virtual('totalQuantity').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual property để tính tổng tiền
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
