const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const user = require('../models/userModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

exports.AddToCart = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body.name);
  const userId = req.params.id;
  const product = req.body.product;
  const hasDuplicateProduct = await Cart.find({ product });
  hasDuplicateProduct.forEach((element) => {
    console.log('ELEMENT', element);
    if (element.user === userId && element.product === product) {
      res.status(400).json({
        status: 'BAD REQUEST',
        message: 'duplicate product',
      });
      return;
    }
  });
  // console.log('is duplicate', hasDuplicateProduct)
  const cart = await Cart.create({
    user: req.body.user,
    product: req.body.product,
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    description: req.body.description,
    image: req.body.image,
  });
  res.status(200).json({
    success: true,
    cart,
  });
});
exports.GetCartItems = catchAsyncErrors(async (req, res, next) => {
  const user = req.params.id;
  const cartItems = await Cart.find({ user }).populate('user');

  res.status(200).json({
    success: true,
    payload: cartItems,
  });
});
exports.removeCartItem = catchAsyncErrors(async (req, res, next) => {
  const ID = req.params.id;
  console.log('idddd', ID);
  await Cart.deleteOne({ product: ID, user: req.user.id });
  res.status(200).json({
    success: true,
    message: 'cart item deleted',
  });
});

exports.removeCart = catchAsyncErrors(async (req, res) => {
  const response = await Cart.deleteMany({ user: req.user.id });
  console.log('response', response);
  res.status(204).json({
    status: 'success',
    message: 'Cart Items Deleted Successfully',
  });
});
