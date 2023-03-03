const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name of Product is a MUST']
    },
    desc: { type: String },
    price: {
        type: Number,
        required: [true, 'provide price please']
    },
    quantity: {
        type: Number,
        required: [true, 'please provide quantity']
    },
    image: { type: String },
    sellerId: {
        type: String,
        default: ''
    }
})

const CartModel = mongoose.model('cart', Schema);
module.exports = CartModel
