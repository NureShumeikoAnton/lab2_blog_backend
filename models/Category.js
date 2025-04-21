const db = require('../config/db.config.js');
const { DataTypes } = require('sequelize');

const Category = db.sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
}, {
    tableName: 'category',
    timestamps: false
});

module.exports = Category;