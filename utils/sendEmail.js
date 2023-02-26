const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
