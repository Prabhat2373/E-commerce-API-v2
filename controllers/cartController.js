const { promisify } = require('util')
const jwt = require("jsonwebtoken");
const Product = require('../models/productModel')
const Cart = require("../models/cartModel");
const user = require("../models/userModel")

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.AddToCart = async (req, res, next) => {
    try {
        const ID = req.params.id;
        const CartProduct = await Product.findById(ID).select("-_id");
        const seller = await user.find({ email: req.cookies.user_email });

        if (await Cart.findById(CartProduct._id)) {
            console.log("CART EXISTS");


            const UpdatedCartItem = await Cart.findOneAndUpdate({ sellerId: seller[0]._id }, {
                $inc: { quantity: +1 }
            }, { new: true });
            res.status(200).json({
                status: "SUCCESS",
                message: "Cart Has Been Updated",
                data: UpdatedCartItem
            })
        }
        else {
            const Item = await Cart.create({ ...CartProduct._doc, quantity: req.body.quantity, sellerId: seller[0]._id });
            console.log("New Item:", Item)

            res.status(200).json({
                status: "SUCCESS",
                message: "Added To Cart Successfully"
            })
            next()
        }
    } catch (err) {
        res.status(400).json({
            status: "BAD REQUEST",
            message: err.message
        })
        next()
    }
}
exports.GetCartItems = async (req, res, next) => {
    try {

        const seller = await user.find({ email: req.cookies.user_email });
        const CartItems = await Cart.find();
        const cart = CartItems.filter((el) => el.sellerId == seller[0]._id ?? []);
        // console.log("CART ITEM :", cart);
        res.status(200).json({
            status: "SUCCESS",
            payload: cart
        })
    } catch (err) {
        res.status(400).json({
            status: "BAD REQUEST",
            message: err.message
        })
    }
}
exports.removeCartItem = async (req, res, next) => {
    try {
        const ID = req.params.id;
        const removedItem = await Cart.deleteOne({ _id: ID });
        res.status(204).json({
            status: "SUCCESS",
            message: "Cart Item Deleted Successfully", removedItem
        })
    } catch (err) {
        res.status(400).json({
            status: "BAD REQUEST",
            message: err.message
        })
    }
}