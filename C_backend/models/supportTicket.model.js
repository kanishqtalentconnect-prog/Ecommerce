import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;