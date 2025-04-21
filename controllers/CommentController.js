const {Comment, User} = require('../models/Relations');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

const commentsCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

function getFromCache(key) {
    return commentsCache.get(key);
}
function setCache(key, data) {
    return commentsCache.set(key, data);
}

const getAllComments = async (req, res) => {
    try {
        const cachedComments = getFromCache('allComments');
        if (cachedComments) {
            console.log('Returning comments from cache');
            return res.status(201).json(cachedComments);
        }
        const comments = await Comment.findAll({
            attributes: ['comment_id', 'content', 'post_id', 'user_id'],
        });
        setCache('allComments', comments);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

const getCommentsByPostId = async (req, res) => {
    try {
        const post_id = req.params.id;
        const cachedComments = getFromCache(`commentsPostId:${post_id}`);
        if (cachedComments) {
            console.log('Returning comments from cache');
            return res.status(201).json(cachedComments);
        }
        const comments = await Comment.findAll({
            where: { post_id: post_id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['login'],
                },
            ],
            attributes: { exclude: ['user_id'] },
        });
        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: 'Comments not found' });
        }
        const plainComments = comments.map(c => c.toJSON());
        setCache(`commentsPostId:${post_id}`, plainComments);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};


const createComment = async (req, res) => {
    try {
        const { content, post_id } = req.body;
        const token = req.headers['authorization'];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const comment = await Comment.create({ content, post_id, user_id: user.user_id });
        commentsCache.del('allComments');
        commentsCache.del(`commentsPostId:${post_id}`);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error });
    }
};

module.exports = {
    getAllComments,
    getCommentsByPostId,
    createComment
}