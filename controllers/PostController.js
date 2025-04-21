const {User, Post, Category} = require('../models/Relations');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

const postsCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

function getFromCache(key) {
    return postsCache.get(key);
}
function setCache(key, data) {
    return postsCache.set(key, data);
}

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
            attributes: { exclude: ['user_id', 'category_id'] },
        });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'Posts not found' });
        }
        const plainPosts = posts.map(p => p.toJSON());
        setCache('allPosts', plainPosts);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

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
        setCache(`post:${postId}`, plainPost);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
    }
};

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
        postsCache.del('allPosts');
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost
}

