const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const errorMiddleware = require("./middleware/error");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config.env" });
}
app.use(cors({ origin: process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://e-commerce-web-4w03.onrender.com' }))
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true
}))

// Route Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

app.get("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "NO ROUTE FOUND!"
  })
});

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
