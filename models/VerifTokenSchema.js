const mongoose = require('mongoose');

const VerifTokenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name field is required']
    },
    
    email: {
        type: String,
        required: [true, 'Email field is required'],
    },

    password: {
        type: String,
        required: [true, 'Password field is required']
    },
    token: {
        type: String,
        required: true
    },

    expireAt: {
        type: Date,
        default: Date.now,
        index: {
            expires: 86400000 
        }
    }
});

module.exports = mongoose.model('VerifToken', VerifTokenSchema);