import Subscription from "../models/subscription.model.js";

export const AllSubscriptionPlan = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const SubscribePlan = async (req, res) => {
  try {
    const { plan, price, endDate } = req.body;
    const subscription = new Subscription({
      userId: req.user.id,
      plan,
      price,
      endDate,
    });
    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    subscription.status = "canceled";
    await subscription.save();
    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};