// Create Token and saving in cookie

const sendToken = (user, statusCode, res, opt) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV) {
    options.secure = true;
    options.SameSite = 'none';
    options.sameSite = 'none';
  }
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    user,
    token,
    OPT: opt,
  });
};

module.exports = sendToken;
