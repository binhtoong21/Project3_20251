import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "general", // We only need one settings doc for now
    },
    storeName: { type: String, default: "BookStore Official" },
    storePhone: { type: String, default: "" },
    storeAddress: {
       street: { type: String, default: "" },
       ward: { type: String, default: "" },
       ward_code: { type: String, default: "" },
       district: { type: String, default: "" },
       district_id: { type: Number, default: null },
       province: { type: String, default: "" },
       province_id: { type: Number, default: null },
       country: { type: String, default: "Việt Nam" }
    }
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
