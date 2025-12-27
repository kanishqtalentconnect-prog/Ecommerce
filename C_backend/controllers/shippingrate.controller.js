import ShippingRate from "../models/shippingrate.model.js";

export const setRate = async (req, res) => {
  try {
    const { city, weight } = req.query;

    if (!city || !weight) {
      return res.status(400).json({ message: "City and weight are required" });
    }

    const rate = await ShippingRate.findOne({
      city: city.toLowerCase(),
      minWeight: { $lte: weight },
      maxWeight: { $gte: weight },
    });

    if (!rate) {
      return res.status(404).json({ message: "No shipping rate found" });
    }

    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: "Error fetching shipping rates", error });
  }
};

export const setNewRate = async (req, res) => {
  try {
    const { city, minWeight, maxWeight, price } = req.body;

    const newRate = new ShippingRate({
      city: city.toLowerCase(),
      minWeight,
      maxWeight,
      price,
    });

    await newRate.save();
    res.status(201).json({ message: "Shipping rate added", rate: newRate });
  } catch (error) {
    res.status(500).json({ message: "Error adding shipping rate", error });
  }
};

export const updateRate = async (req, res) => {
  try {
    const { city, minWeight, maxWeight, price } = req.body;
    const updatedRate = await ShippingRate.findByIdAndUpdate(
      req.params.id,
      { city: city.toLowerCase(), minWeight, maxWeight, price },
      { new: true }
    );

    if (!updatedRate) {
      return res.status(404).json({ message: "Shipping rate not found" });
    }

    res.json({ message: "Shipping rate updated", rate: updatedRate });
  } catch (error) {
    res.status(500).json({ message: "Error updating shipping rate", error });
  }
};

export const deleteRate = async (req, res) => {
  try {
    const deletedRate = await ShippingRate.findByIdAndDelete(req.params.id);

    if (!deletedRate) {
      return res.status(404).json({ message: "Shipping rate not found" });
    }

    res.json({ message: "Shipping rate deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting shipping rate", error });
  }
};