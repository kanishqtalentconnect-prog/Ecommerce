import SupportTicket from "../models/supportTicket.model.js";

export const getAllTicket = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user.id }).populate("userId", "name email");
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving support tickets", error: error.message });
  }
};

export const newTicket = async (req, res) => {
  try {
    console.log("User Data:", req.user);  // 🛠 Debugging line

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { subject, description } = req.body;
    const newTicket = new SupportTicket({
      userId: req.user.id,
      subject,
      description,
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ message: "Error creating support ticket", error: error.message });
  }
};


export const updateTicket = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTicket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Error updating support ticket", error: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const deletedTicket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!deletedTicket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }
    res.status(200).json({ message: "Support ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting support ticket", error: error.message });
  }
};