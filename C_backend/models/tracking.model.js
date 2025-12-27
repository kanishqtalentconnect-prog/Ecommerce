import { mongoose } from "mongoose";

const TrackingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Out of Delivery", "Delivered", "Cancelled"],
        default: "Pending",
    },
    estimatedDelivery: {
        type: Date,
    },
    location: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

const Tracking = mongoose.model("Tracking", TrackingSchema);

export default Tracking;