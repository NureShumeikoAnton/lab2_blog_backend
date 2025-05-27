const {User, Post, Category} = require('../models/Relations');
const jwt = require('jsonwebtoken');

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['login']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }
            ],
            attributes: {exclude: ['user_id', 'category_id']},
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
}

const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findOne({
            where: { post_id: postId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['login']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }
            ],
            attributes: { exclude: ['user_id', 'category_id'] }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
    }
}

const createPost = async (req, res) => {
    try {
        const { title, content, category_name } = req.body;
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let category = await Category.findOne({ where: { name: category_name } });
        if (!category) {
            category = await Category.create({ name: category_name });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const post = await Post.create({ title, content, user_id: user.user_id, category_id: category.category_id });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
}

const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, category_name } = req.body;
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user_id !== user.user_id) {
            return res.status(403).json({ message: 'Forbidden - You can only update your own posts' });
        }

        let category = await Category.findOne({ where: { name: category_name } });
        if (!category) {
            category = await Category.create({ name: category_name });
        }

        await post.update({
            title: title || post.title,
            content: content || post.content,
            category_id: category.category_id
        });

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
}

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user_id !== user.user_id) {
            return res.status(403).json({ message: 'Forbidden - You can only delete your own posts' });
        }

        await post.destroy();

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
}

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
}

