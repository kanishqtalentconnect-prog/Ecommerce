import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "canceled", "expired"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;