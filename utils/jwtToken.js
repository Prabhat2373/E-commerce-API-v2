// Create Token and saving in cookie

const sendToken = (user, statusCode, res, opt) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    SameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  };
  // res.setHeader('set-cookie', [
  //   'cookie1=value1; SameSite=Lax',
  //   'cookie2=value2; SameSite=None; Secure',
  // ]);
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
    OPT: opt
  });
};

module.exports = sendToken;
