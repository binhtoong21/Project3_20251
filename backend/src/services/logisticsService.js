import Shipment from "../models/shipment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Book from "../models/book.model.js";
import Transaction from "../models/transaction.model.js";
/**
 * Generate a unique tracking code
 */
const generateTrackingCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LS${timestamp}${random}`;
};

/**
 * Create a new Shipment for an Order
 */
export const createShipment = async (orderData) => {
    const trackingCode = generateTrackingCode();
    
    const shipment = new Shipment({
        trackingCode,
        order: orderData.orderId,
        
        fromName: orderData.fromName,
        fromPhone: orderData.fromPhone,
        fromAddress: orderData.fromAddress,
        fromDistrict: orderData.fromDistrict,
        fromProvince: orderData.fromProvince,
        
        toName: orderData.toName,
        toPhone: orderData.toPhone,
        toAddress: orderData.toAddress,
        toDistrict: orderData.toDistrict,
        toProvince: orderData.toProvince,
        
        weight: orderData.weight || 200,
        codAmount: orderData.codAmount || 0,
        shippingFee: orderData.shippingFee || 0,
        
        status: 'Pending',
        statusHistory: [{
            status: 'Pending',
            timestamp: new Date(),
            note: 'Đơn hàng được tạo, chờ lấy hàng'
        }],
        
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });
    
    await shipment.save();
    
    console.log(`[LOGISTICS] Shipment Created: ${trackingCode} for Order ${orderData.orderId}`);
    
    return {
        trackingCode,
        estimatedDelivery: shipment.estimatedDelivery,
        shippingFee: shipment.shippingFee
    };
};

/**
 * Update Shipment Status and trigger webhook callback to update Order
 */
export const updateShipmentStatus = async (trackingCode, newStatus, note = '') => {
    const shipment = await Shipment.findOne({ trackingCode });
    
    if (!shipment) {
        throw new Error(`Shipment not found: ${trackingCode}`);
    }
    
    const oldStatus = shipment.status;
    shipment.status = newStatus;
    shipment.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: note || `Trạng thái chuyển từ ${oldStatus} sang ${newStatus}`
    });
    
    if (newStatus === 'Delivered') {
        shipment.actualDelivery = new Date();
    }
    
    await shipment.save();
    
    console.log(`[LOGISTICS] Shipment ${trackingCode}: ${oldStatus} -> ${newStatus}`);
    
    // Trigger webhook to update Order
    await triggerOrderWebhook(shipment);
    
    return shipment;
};


/**
 * Internal Webhook: Update Order status based on Shipment status
 */
const triggerOrderWebhook = async (shipment) => {
    try {
        const order = await Order.findById(shipment.order);
        
        if (!order) {
            console.error(`[LOGISTICS WEBHOOK] Order not found: ${shipment.order}`);
            return;
        }
        
        // Map Shipment Status to Order Status
        const statusMap = {
            'Pending': 'Pending',
            'PickedUp': 'Shipped',
            'InTransit': 'Shipped',
            'Delivered': 'Delivered',
            'DeliveryFailed': 'Cancelled', // Update to Cancelled on failure
            'Returning': 'Cancelled', 
            'Returned': 'Cancelled' 
        };
        
        const newOrderStatus = statusMap[shipment.status];
        
        if (newOrderStatus && order.status !== newOrderStatus) {
            // CRITICAL: Prevent regression. If Order is already in a terminal state (Delivered, Completed, Cancelled),
            // do NOT revert to a previous state.
            const terminalStates = ['Delivered', 'Completed', 'Cancelled'];
            if (terminalStates.includes(order.status)) {
                console.log(`[LOGISTICS WEBHOOK] Order ${order._id} is in terminal state '${order.status}'. Ignoring update to '${newOrderStatus}'.`);
                return; 
            }

            // HANDLE CANCELLATION LOGIC (Refund + Restock)
            if (newOrderStatus === 'Cancelled') {
                console.log(`[LOGISTICS WEBHOOK] Order ${order._id} cancelled due to delivery failure. Restoring stock/funds.`);
                
                // 1. Restore Stock
                if (order.orderItems && order.orderItems.length > 0) {
                    const stockUpdateOps = order.orderItems.map(item => ({
                        updateOne: {
                            filter: { _id: item.book },
                            update: { $inc: { stock: item.quantity } }
                        }
                    }));
                    await Book.bulkWrite(stockUpdateOps);
                }

                // 2. Refund Wallet (if paid by wallet)
                if (order.paymentMethod === 'wallet' && order.isPaid) {
                    const refundAmount = order.totalPrice;
                    await User.findByIdAndUpdate(order.user, {
                        $inc: { walletBalance: refundAmount }
                    });
                    
                    await Transaction.create({
                        user: order.user,
                        type: 'refund',
                        amount: refundAmount,
                        status: 'completed',
                        relatedEntity: { id: order._id, model: 'Order' },
                        description: `Hoàn tiền tự động đơn hàng ${order._id} (Giao hàng thất bại)`,
                    });
                    
                    order.escrowStatus = 'Refunded';
                }
            }

            order.status = newOrderStatus;
            
            // Update shipping info on Order
            order.shipping = order.shipping || {};
            order.shipping.status = shipment.status;
            
            if (shipment.status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = shipment.actualDelivery;
                
                // Handle COD payment completion
                if (order.paymentMethod === 'COD') {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    // NOTE: Funds for COD are held by carrier, released later manually or via reconciliation
                }
            }
            
            await order.save();
            console.log(`[LOGISTICS WEBHOOK] Order ${order._id} updated to ${newOrderStatus}`);
        }
        
    } catch (error) {
        console.error(`[LOGISTICS WEBHOOK] Error updating order:`, error.message);
    }
};

/**
 * Get all Shipments (for Logistics Portal)
 */
export const getAllShipments = async (filters = {}) => {
    const query = {};
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    const shipments = await Shipment.find(query)
        .sort({ createdAt: -1 })
        .populate('order', 'orderItems totalPrice paymentMethod')
        .limit(100);
    
    return shipments;
};

/**
 * Get Shipment by Tracking Code
 */
export const getShipmentByTrackingCode = async (trackingCode) => {
    const shipment = await Shipment.findOne({ trackingCode })
        .populate('order', 'orderItems totalPrice paymentMethod shippingAddress user');
    
    return shipment;
};

/**
 * Get Shipment Stats
 */
export const getShipmentStats = async () => {
    const stats = await Shipment.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    const result = {
        Pending: 0,
        PickedUp: 0,
        InTransit: 0,
        Delivered: 0,
        DeliveryFailed: 0,
        Returning: 0,
        Returned: 0,
        total: 0
    };
    
    stats.forEach(s => {
        result[s._id] = s.count;
        result.total += s.count;
    });
    
    return result;
};
