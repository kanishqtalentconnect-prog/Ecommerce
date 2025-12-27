import { Category } from "../models/categories.model.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all categories for admin (including inactive)
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create new category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, title } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // Check if category with same name exists
    const nameExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (nameExists) {
      return res.status(400).json({ success: false, message: "Category with this name already exists" });
    }

    // Generate slug if not provided
    let categorySlug = slug;
    if (!categorySlug) {
      categorySlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Check if slug exists
    const slugExists = await Category.findOne({ slug: categorySlug });
    if (slugExists) {
      return res.status(400).json({ success: false, message: "Category with this slug already exists" });
    }

    const category = await Category.create({ 
      name: name.trim(), 
      slug: categorySlug,
      title: title?.trim() || null
    });

    res.status(201).json({ success: true, category, message: "Category created successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { name, slug, title, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const nameExists = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (nameExists) {
        return res.status(400).json({ success: false, message: "Category with this name already exists" });
      }
    }

    // Check if new slug conflicts with existing category
    if (slug && slug !== category.slug) {
      const slugExists = await Category.findOne({ 
        slug: slug,
        _id: { $ne: req.params.id }
      });
      if (slugExists) {
        return res.status(400).json({ success: false, message: "Category with this slug already exists" });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (slug) category.slug = slug.trim();
    if (title !== undefined) category.title = title?.trim() || null;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();
    res.json({ success: true, category: updatedCategory, message: "Category updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Category name or slug already exists" });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Toggle category status (Admin only)
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.isActive = !category.isActive;
    const updatedCategory = await category.save();

    res.json({ 
      success: true, 
      category: updatedCategory, 
      message: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};