const express = require('express');
const { login, register, getUserByToken } = require('../controllers/AuthController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/getuser', getUserByToken);

module.exports = router;