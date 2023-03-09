const { promisify } = require('util')
const jwt = require("jsonwebtoken");
const Product = require('../models/productModel')
const Cart = require("../models/cartModel");
const user = require("../models/userModel");
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.AddToCart = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body.name)
    const userId = req.params.id;
    const cart = await Cart.create({
        userId,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: req.body.image
    });
    res.status(200).json({
        success: true,
        cart,
    });
})
exports.GetCartItems = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
    const cartItems = await Cart.find({ userId });

    res.status(200).json({
        success: true,
        payload: cartItems
    })
})
exports.removeCartItem = catchAsyncErrors(async (req, res, next) => {
    const ID = req.params.id;
    const deleteCartItem = await Cart.deleteOne({ _id: ID });
    res.status(204).json({
        success: true,
        message: 'cart item deleted'
    })
})