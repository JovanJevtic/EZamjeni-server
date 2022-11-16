const User = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const VerifToken = require('../models/VerifTokenSchema');
const nodemailer = require('nodemailer');

//? Generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
}

//? Register User, post to '/'
const registerUser = asyncHandler( async (req, res) => {
    const { verifTokenId, confirmToken } = req.body;
    console.log(req.body.verifTokenId);
    const verifToken = await VerifToken.findById(verifTokenId);

    if (!verifToken) { 
        res.status(400);
        throw new Error('Something went wrong, please try again!');
    }

    const token = verifToken.token;
    if (token === confirmToken) {
        const userExists = await User.findOne({ email: verifToken.email });
        if (userExists) {
            res.status(400);
            throw new Error('User with this email already exists!')
        }


        try {
            const user = await User.create({
                name: verifToken.name,
                email: verifToken.email,
                password: verifToken.password,
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
    } else {
        res.status(500);
        throw new Error(`Invalid code`);
    }
});

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


//? Confirm Email
const confirmEmail = asyncHandler( async (req, res) => {
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
    const token = (Math.floor(100000 + Math.random() * 900000)).toString();

    const verifToken = await VerifToken.create({
        name: name,
        email: email,
        password: hashedPwd,
        token: token
    });

    try {
        const transporter = nodemailer.createTransport({ 
            service: 'gmail',
            auth: { 
                user: process.env.NODEMAILER_AUTH_EMAIL, 
                pass: process.env.NODEMAILER_AUTH_PWD
            } 
        });

        const mailOptions = { 
            from: process.env.NODEMAILER_AUTH_EMAIL, 
            to: email,     
            subject: 'Account Verification Link', 
            html: 'Hello '+ name +',\n\n' + 'Your verification number is ' + verifToken.token  + '\n\nThank You!\n' 
        };

        try {
            const sendResult = await transporter.sendMail(mailOptions);
            res.status(200).json({ verifTokenId: verifToken._id });
        } catch (error) {
            res.status(400);
            throw new Error(error);
        }
    } catch (error) {
        res.status(400);
        throw new Error(error);        
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUserById,
    confirmEmail
}