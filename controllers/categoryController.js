// controllers/categoryController.js
const Category = require('../models/category');

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name, createdBy: req.user._id });
        await newCategory.save();
        res.status(201).json({ message: 'Category created successfully', category: newCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category updated successfully', updatedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
