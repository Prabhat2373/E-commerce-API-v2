const express = require('express');
const {
  AddToCart,
  GetCartItems,
  removeCartItem,
} = require('../controllers/cartController');
const { isAuthenticatedUser } = require('../middleware/auth');
const router = express.Router();

router
  .route('/cart/:id')
  .post(isAuthenticatedUser, AddToCart)
  .get(isAuthenticatedUser, GetCartItems)
  .delete(isAuthenticatedUser, removeCartItem);
router.route('/cart').get(GetCartItems);

module.exports = router;
