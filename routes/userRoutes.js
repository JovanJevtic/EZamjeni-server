const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/userControllers');

router.post('/', registerUser);
router.post('/login', loginUser);
// router.get('/confirmation/:email/:token', confirmEmail);
// router.post('/confirmation/resendEmail', resendEmail );
// router.put('/me')
// router.get('/me')
// router.get('/:id')

module.exports = router;