const express = require('express');
const { AddToCart, removeCartItem, GetCartItems } = require('../controllers/cartController');
const router = express.Router()

router.route("/cart/:id").post(AddToCart).delete(removeCartItem)
router.route("/cart").get(GetCartItems);

module.exports = router