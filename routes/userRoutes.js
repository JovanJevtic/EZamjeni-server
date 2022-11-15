const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authUser');
 
const { registerUser, loginUser, getMe, getUserById } = require('../controllers/userControllers');

router.post('/', registerUser);
router.post('/login', loginUser);
// router.get('/confirmation/:email/:token', confirmEmail);
// router.post('/confirmation/resendEmail', resendEmail );
// router.put('/me')
router.get('/me', protect, getMe);
router.get('/:id', getUserById);

module.exports = router;