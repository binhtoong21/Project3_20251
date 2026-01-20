import express from "express";
import { getShipments, getShipment, updateStatus, getStats } from "../controllers/logistics.controller.js";

const router = express.Router();

// No authentication - this is the Logistics Simulator Portal
router.get("/shipments", getShipments);
router.get("/shipments/:trackingCode", getShipment);
router.put("/shipments/:trackingCode/status", updateStatus);
router.get("/stats", getStats);

export default router;
