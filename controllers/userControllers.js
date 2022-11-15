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
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
  }
});

//? Get my User, get to '/me'
const getMe = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(404).json({message: 'You are not logged in'});
    } 
    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email
    });
});

//? Update my User, put to '/me'

//? Get User by ID, get to '/:id'
const getUserById = asyncHandler( async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404).json({ message: 'User dooes not exist' })
    }
    
    res.status(200).json({ name: user.name, email: user.email })
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUserById
}