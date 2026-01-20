import { Router } from "express";
import { 
    getProvinces, 
    getDistricts, 
    getWards, 
    calculateShippingFee 
} from "../controllers/location.controller.js";

const router = Router();

router.get("/provinces", getProvinces);
router.get("/districts/:provinceId", getDistricts);
router.get("/wards/:districtId", getWards);
router.post("/calculate-fee", calculateShippingFee);

export default router;
