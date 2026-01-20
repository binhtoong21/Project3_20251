import * as locationService from "../services/locationService.js";

export const getProvinces = async (req, res, next) => {
  try {
    const provinces = await locationService.getProvinces();
    res.json(provinces);
  } catch (error) {
    next(error);
  }
};

export const getDistricts = async (req, res, next) => {
  try {
    const { provinceId } = req.params;
    const districts = await locationService.getDistricts(provinceId);
    res.json(districts);
  } catch (error) {
    next(error);
  }
};

export const getWards = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const wards = await locationService.getWards(districtId);
    res.json(wards);
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate Shipping Fee using Distance-Based Flat Rate
 * Option B: Nội thành 20k, Ngoại thành 35k, Liên tỉnh 50k
 */
export const calculateShippingFee = async (req, res, next) => {
  try {
    const { from_district_id, to_district_id, to_province_id } = req.body;
    
    // Get Store's province from Settings if not provided
    let fromProvinceId = req.body.from_province_id;
    let fromDistrictId = from_district_id;
    
    if (!fromProvinceId || !fromDistrictId) {
        const Setting = (await import("../models/setting.model.js")).default;
        const settings = await Setting.findOne({ key: "general" });
        
        if (settings && settings.storeAddress) {
            fromProvinceId = settings.storeAddress.province_id;
            fromDistrictId = settings.storeAddress.district_id;
        }
    }
    
    // Determine fee based on location
    let shippingFee = 50000; // Default: Inter-province (Liên tỉnh)
    
    if (fromProvinceId && to_province_id) {
        if (fromProvinceId === to_province_id) {
            // Same province
            if (fromDistrictId === to_district_id) {
                // Same district (Nội thành)
                shippingFee = 20000;
            } else {
                // Different district, same province (Ngoại thành)
                shippingFee = 35000;
            }
        }
        // else: Different province -> 50k (default)
    }
    
    console.log(`[SHIPPING FEE] From Province: ${fromProvinceId}, To Province: ${to_province_id} => Fee: ${shippingFee}`);
    
    res.json({
        total: shippingFee,
        service_fee: shippingFee,
        insurance_fee: 0
    });

  } catch (error) {
    console.error("Shipping Fee Error:", error.message);
    next(error);
  }
};
