import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import mongoose from 'mongoose';

/**
 * Executes the logic to confirm an order receipt and release funds/update status.
 * Can be called by User (API) or System (Cron).
 * @param {string} orderId 
 * @param {string|null} userId - The user triggering the action (null if system)
 * @returns {Promise<Object>} The updated order
 */
export const executeConfirmReceipt = async (orderId, userId = null) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new Error("Order not found");
        }

        // Helper check: If userId is provided, ensure they own the order
        if (userId && order.user.toString() !== userId.toString()) {
             throw new Error("Not authorized");
        }

        // Validate Status
        if (order.status === 'Pending') {
            throw new Error("Cannot confirm receipt for Pending order.");
        }

        // Validate Funds State
        if (order.paymentMethod === 'wallet') {
            if (order.escrowStatus !== 'Held') {
                 // Idempotency: If already released, just return the order
                 if (order.escrowStatus === 'Released') {
                     await session.abortTransaction();
                     return order;
                 }
                throw new Error("Order funds are not currently held.");
            }
        } else {
             if (order.status === 'Completed' || order.status === 'Cancelled') {
                await session.abortTransaction();
                return order;
             }
        }

        // RELEASE FUNDS LOGIC
        if (order.paymentMethod === 'wallet') {
            const sellerPayouts = new Map();
            const sellerFees = new Map();

            for (const item of order.orderItems) {
                if (item.seller) {
                    const sellerId = item.seller.toString();
                    const earnings = item.price * item.quantity;
                    const fee = earnings * 0.02; // 2% fee

                    sellerPayouts.set(sellerId, (sellerPayouts.get(sellerId) || 0) + earnings);
                    sellerFees.set(sellerId, (sellerFees.get(sellerId) || 0) + fee);
                }
            }

            if (sellerPayouts.size > 0) {
                const sellerUpdateOps = [];
                const transactionCreateOps = [];

                for (const [sellerId, totalEarnings] of sellerPayouts.entries()) {
                    const totalFee = sellerFees.get(sellerId) || 0;
                    const netEarnings = totalEarnings - totalFee;

                    sellerUpdateOps.push({
                        updateOne: {
                            filter: { _id: sellerId },
                            update: { $inc: { walletBalance: netEarnings } },
                        },
                    });
                    transactionCreateOps.push({
                        user: sellerId,
                        type: 'sale_income',
                        amount: netEarnings,
                        fee: totalFee,
                        status: 'completed',
                        relatedEntity: { id: order._id, model: 'Order' },
                        description: `Tiền bán sách từ đơn hàng ${order._id} (Đã trừ phí sàn ${totalFee})`,
                    });
                }

                await User.bulkWrite(sellerUpdateOps, { session });
                await Transaction.create(transactionCreateOps, { session });
            }
            order.escrowStatus = 'Released';
        }

        order.status = 'Completed';
        // Only update deliveredAt if it wasn't already set (e.g. if skipped straight to Completed)
        if (!order.isDelivered) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save({ session });
        await session.commitTransaction();
        return updatedOrder;

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
