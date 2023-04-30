const ErrorHander = require('../utils/errorhander');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const productModel = require('../models/productModel');

// Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  console.log('REQUEST :', req.files.avatar.name);
  const image = req.files.avatar;
  const myCloud = await cloudinary.v2.uploader.upload(image.tempFilePath, {
    folder: 'avatars',
    width: 150,
    crop: 'scale',
  });
  console.log('CLOUD :', myCloud);
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res, { cloud: myCloud.secure_url });
});

// Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHander('Please Enter Email & Password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHander('Invalid email or password', 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander('Invalid password', 401));
  }

  sendToken(user, 200, res);
});
exports.AddBillingDetails = catchAsyncErrors(async (req, res, next) => {
  const ID = req.params.id;
  console.log('body', req.body);
  const billing = await User.findOneAndUpdate(
    { _id: ID },
    {
      billing_info: {
        billing_first_name: req.body.first_name,
        billing_last_name: req.body.last_name,
        billing_email: req.body.email,
        billing_phone: req.body.phone,
        billing_address_line1: req.body.address1,
        billing_address_line2: req.body.address2,
        billing_city: req.body.city,
        billing_state: req.body.state,
        billing_zip: req.body.zip,
        billing_country: req.body.country,
      },
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Billing Details Added Successfully',
    data: billing,
  });
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged Out',
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander('User not found', 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHander(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHander(
        'Reset Password Token is invalid or has been expired',
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHander('Password does not password', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  console.log('USER ID', req.user);
  const user = await User.findById(req.user.id);
  console.log('user', user);
  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander('Old password is incorrect', 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander('password does not match', 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== '') {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'avatars',
      width: 150,
      crop: 'scale',
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    message: 'User Deleted Successfully',
  });
});

exports.getBillingDetails = catchAsyncErrors(async (req, res) => {
  const billing = await User.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'address found successfully',
    payload: billing.billing_info,
  });
});

exports.addToCartProducts = catchAsyncErrors(async (req, res) => {
  console.log('body', req.body);
  const product_id = await User.findOne({
    cart: { $elemMatch: { product: req.body.product } },
  });

  const CartItem = await User.updateOne(
    { _id: req.user.id },
    {
      $push: { cart: req.body },
    },
    {
      new: true,
    }
  );
  // const CartItem = await User.find({ cart: [] });
  console.log('cart item:', CartItem);

  console.log('CART ITEM', CartItem);
  res.status(200).json({
    success: true,
    payload: CartItem,
  });
});
