const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }
})

const CartModel = mongoose.model('cart', Schema);
module.exports = CartModel
