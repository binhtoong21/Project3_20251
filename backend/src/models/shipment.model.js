import mongoose from "mongoose";

const { Schema } = mongoose;

const shipmentSchema = new Schema({
    trackingCode: { 
        type: String, 
        required: true, 
        unique: true 
    },
    order: { 
        type: Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },
    
    // Sender Info
    fromName: { type: String, required: true },
    fromPhone: { type: String, required: true },
    fromAddress: { type: String, required: true },
    fromDistrict: { type: String },
    fromProvince: { type: String },
    
    // Receiver Info
    toName: { type: String, required: true },
    toPhone: { type: String, required: true },
    toAddress: { type: String, required: true },
    toDistrict: { type: String },
    toProvince: { type: String },
    
    // Shipment Details
    weight: { type: Number, default: 200 }, // grams
    codAmount: { type: Number, default: 0 }, // Cash on Delivery amount
    shippingFee: { type: Number, default: 0 },
    
    // Status (Controlled by Logistics Portal)
    status: {
        type: String,
        enum: ['Pending', 'PickedUp', 'InTransit', 'Delivered', 'DeliveryFailed', 'Returning', 'Returned'],
        default: 'Pending'
    },
    
    statusHistory: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    
    // Timestamps
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date }
}, { 
    timestamps: true 
});

// Index for faster lookups
shipmentSchema.index({ trackingCode: 1 });
shipmentSchema.index({ order: 1 });
shipmentSchema.index({ status: 1 });

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;
