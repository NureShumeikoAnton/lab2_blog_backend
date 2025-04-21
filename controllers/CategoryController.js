const {Category} = require('../models/Relations');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['category_id', 'name'],
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
}

module.exports = {
    getAllCategories
}