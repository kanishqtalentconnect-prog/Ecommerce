import mongoose from "mongoose";

const ShippingRateSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    minWeight: {
        type: Number,
        required: true
    },
    maxWeight: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

const ShippingRate = mongoose.model("ShippingRate", ShippingRateSchema)

export default ShippingRate;