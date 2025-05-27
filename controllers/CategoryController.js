const {Category, User} = require('../models/Relations');
const jwt = require('jsonwebtoken');
const {flushAll} = require('../cache/cache');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['category_id', 'name'],
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({message: 'Error fetching categories', error});
    }
}

const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const {name} = req.body;
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        if(decoded.id !== 1) {
            return res.status(403).json({message: 'Forbidden'});
        }
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({message: 'Category not found'});
        }
        category.name = name;
        await category.save();
        flushAll();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({message: 'Error updating category', error});
    }
}

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        if(decoded.id !== 1) {
            return res.status(403).json({message: 'Forbidden'});
        }
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({message: 'Category not found'});
        }
        await category.destroy();
        flushAll();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({message: 'Error deleting category', error});
    }
}

module.exports = {
    getAllCategories,
    updateCategory,
    deleteCategory
}
