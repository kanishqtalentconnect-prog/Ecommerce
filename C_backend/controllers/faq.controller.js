import { validationResult } from "express-validator";
import Faq from "../models/faq.model.js";

// Get All FAQs
export const getAllFaq = async (req, res) => {
  try {
    const faqs = await Faq.find();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addNewFaq = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { question, answer } = req.body;
    const newFaq = await Faq.create({ question, answer });
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Update FAQ
export const updateFaq = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Delete FAQ
export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};