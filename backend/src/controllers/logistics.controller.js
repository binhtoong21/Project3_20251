import * as logisticsService from "../services/logisticsService.js";

/**
 * @desc    Get all shipments (for Logistics Portal)
 * @route   GET /api/logistics/shipments
 * @access  Public (No auth - this is the simulator)
 */
export const getShipments = async (req, res, next) => {
    try {
        const { status } = req.query;
        const shipments = await logisticsService.getAllShipments({ status });
        res.json(shipments);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get shipment by tracking code
 * @route   GET /api/logistics/shipments/:trackingCode
 * @access  Public
 */
export const getShipment = async (req, res, next) => {
    try {
        const { trackingCode } = req.params;
        const shipment = await logisticsService.getShipmentByTrackingCode(trackingCode);
        
        if (!shipment) {
            res.status(404);
            throw new Error("Shipment not found");
        }
        
        res.json(shipment);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update shipment status
 * @route   PUT /api/logistics/shipments/:trackingCode/status
 * @access  Public (Logistics Portal)
 */
export const updateStatus = async (req, res, next) => {
    try {
        const { trackingCode } = req.params;
        const { status, note } = req.body;
        
        if (!status) {
            res.status(400);
            throw new Error("Status is required");
        }
        
        const validStatuses = ['Pending', 'PickedUp', 'InTransit', 'Delivered', 'DeliveryFailed', 'Returning', 'Returned'];
        if (!validStatuses.includes(status)) {
            res.status(400);
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        
        const shipment = await logisticsService.updateShipmentStatus(trackingCode, status, note);
        res.json(shipment);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get shipment statistics
 * @route   GET /api/logistics/stats
 * @access  Public
 */
export const getStats = async (req, res, next) => {
    try {
        const stats = await logisticsService.getShipmentStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};
