const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodemailerConfig);

  const info = await transporter.sendMail({
    from: '"Testing Email" <testing@hotmail.com>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
