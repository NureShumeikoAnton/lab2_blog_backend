const {User} = require('../models/Relations');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const {login, password} = req.body;
        const user = await User.findOne({where: {login, password}});
        if (!user) {
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({id: user.user_id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(200).json({token});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

const register = async (req, res) => {
    try {
        const {login, password} = req.body;
        console.log(req.body);
        const user = await User.create({login, password});
        const token = jwt.sign({id: user.user_id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        return res.status(201).json({token});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

const verifyToken = async (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return await User.findByPk(decoded.id);
    } catch (error) {
        return null;
    }
};

const getUserByToken = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const user = await verifyToken(token);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        return res.status(200).json({ 
            user_id: user.user_id, 
            login: user.login 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login,
    register,
    getUserByToken
}