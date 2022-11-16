const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authUser');
 
const { registerUser, loginUser, getMe, getUserById, confirmEmail } = require('../controllers/userControllers');

router.post('/', registerUser);
router.post('/login', loginUser);

router.post('/confirmEmail', confirmEmail);

// router.put('/me')
router.get('/me', protect, getMe);
router.get('/:id', getUserById);

module.exports = router;