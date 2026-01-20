import cron from 'node-cron';
import Order from '../models/order.model.js';
import { executeConfirmReceipt } from './orderService.js';

const startCronJobs = () => {
    console.log('Starting Cron Jobs...');

    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Auto-Confirm Order Cron Job...');
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Find orders that are:
            // 1. Delivered
            // 2. Delivered more than 7 days ago
            // 3. Not yet Completed (or funds still Held)
            const eligibleOrders = await Order.find({
                status: 'Delivered',
                deliveredAt: { $lt: sevenDaysAgo },
                // Efficiently filter only those needing update
                $or: [
                    { status: { $ne: 'Completed' } },
                    { escrowStatus: 'Held' } // Catch wallet orders that might be Delivered but not Released
                ]
            });

            console.log(`Found ${eligibleOrders.length} orders to auto-confirm.`);

            for (const order of eligibleOrders) {
                try {
                    console.log(`Auto-confirming order: ${order._id}`);
                    await executeConfirmReceipt(order._id, null); // null userId = system action
                } catch (err) {
                    console.error(`Failed to auto-confirm order ${order._id}:`, err.message);
                }
            }
        } catch (error) {
            console.error('Error in Auto-Confirm Cron Job:', error);
        }
    });
};

export default startCronJobs;
