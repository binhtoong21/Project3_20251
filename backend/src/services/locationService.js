import axios from "axios";

// GHN API for Location Data only (no order creation)
const GHN_API_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN;

const client = axios.create({
  baseURL: GHN_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Token: GHN_TOKEN,
  },
});

// Location APIs (Still using GHN Master Data)
export const getProvinces = async () => {
  try {
    const response = await client.get("/master-data/province");
    return response.data.data;
  } catch (error) {
    console.error("GHN getProvinces Error:", error.message);
    throw new Error("Unable to fetch provinces");
  }
};

export const getDistricts = async (provinceId) => {
  try {
    const response = await client.post("/master-data/district", {
      province_id: parseInt(provinceId),
    });
    return response.data.data;
  } catch (error) {
    console.error("GHN getDistricts Error:", error.message);
    throw new Error("Unable to fetch districts");
  }
};

export const getWards = async (districtId) => {
  try {
    const response = await client.post("/master-data/ward", {
      district_id: parseInt(districtId),
    });
    return response.data.data;
  } catch (error) {
    console.error("GHN getWards Error:", error.message);
    throw new Error("Unable to fetch wards");
  }
};
