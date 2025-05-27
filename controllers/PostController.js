const {User, Post, Category, Comment} = require('../models/Relations');
const jwt = require('jsonwebtoken');
const { getFromCache, setCache, delCache } = require('../cache/cache');

const getAllPosts = async (req, res) => {
    try {
        const cachedPosts = getFromCache('allPosts');
        if (cachedPosts) {
            return res.status(201).json(cachedPosts);
        }
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
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'Posts not found' });
        }
        const plainPosts = posts.map(p => p.toJSON());
        const postsWithComments = await Promise.all(plainPosts.map(async post => {
            const count = await Comment.count({ where: { post_id: post.post_id } });
            return { ...post, commentsCount: count };
        }));
        setCache('allPosts', postsWithComments);
        res.status(200).json(postsWithComments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
}

const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const cachedPost = getFromCache(`post:${postId}`);
        if (cachedPost) {
            console.log('Returning post from cache');
            return res.status(201).json(cachedPost);
        }
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
        const plainPost = post.toJSON();
        plainPost.commentsCount = await Comment.count({where: {post_id: postId}});
        setCache(`post:${postId}`, plainPost);
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        let category = await Category.findOne({ where: { name: category_name } });
        if (!category) {
            category = await Category.create({ name: category_name });
        }
        const post = await Post.create({
            title,
            content,
            user_id: user.user_id,
            category_id: category.category_id
        });
        delCache('allPosts');
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
        delCache('allPosts');
        delCache(`post:${postId}`);
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
        const post = await Post.findOne({ where: { post_id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user_id !== user.user_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await Post.destroy({ where: { post_id: postId } });
        delCache('allPosts');
        res.status(204).send();
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
};