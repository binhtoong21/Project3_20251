import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },

    isBlocked: { type: Boolean, default: false }, // dùng cho block user ở admin
    
    // EMAIL VERIFICATION
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationTokenExpiry: { type: Date, default: null },
    
    // PASSWORD RESET
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpiry: { type: Date, default: null },
    
    avatar: { type: String, default: "" },

    // VALIDATE SỐ ĐIỆN THOẠI
    phone: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          // Cho phép rỗng (lúc mới tạo) HOẶC phải đúng định dạng VN (10 số, đầu 03, 05, 07, 08, 09)
          return v === "" || /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(v);
        },
        message: (props) =>
          `${props.value} không phải là số điện thoại hợp lệ!`,
      },
    },

    // CẤU TRÚC ĐỊA CHỈ CHUẨN VIỆT NAM
    address: {
      province: { type: String, default: "" }, // Tỉnh/Thành phố
      district: { type: String, default: "" }, // Quận/Huyện
      ward: { type: String, default: "" }, // Phường/Xã
      street: { type: String, default: "" }, // Số nhà, tên đường
    },
    walletBalance: { type: Number, default: 0 },
    bankAccounts: [
      {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true },
        branch: { type: String }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model("User", userSchema);

export default User;
