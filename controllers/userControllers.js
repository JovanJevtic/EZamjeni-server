const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

//? Generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
}

//? Register User, post to '/'
const registerUser = asyncHandler( async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) { 
        res.status(400);
        throw new Error('Please enter all fields!');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists!')
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(password, salt);

    try {
        const user = await User.create({
            name,
            email,
            password: hashedPwd,
        });
        
        res.status(201).json({ 
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } catch (error) {
        res.status(400);
        throw new Error(error);
    }
})

//? Login User, post to '/login'

//? Get my User, get to '/me'

//? Update my User, put to '/me'

//? Get User by ID, get to '/:id'

module.exports = {
    registerUser
}