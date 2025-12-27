import Blog from "../models/blog.model.js";

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new blog (Admin only)
export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newBlog = new Blog({ title, content, author: req.user.id });
    await newBlog.save();
    res
      .status(201)
      .json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a blog (Admin only)
export const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedBlog)
      return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a blog (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};