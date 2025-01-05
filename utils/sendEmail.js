const nodemailer = require("nodemailer");

// todo: i used the secure false and port 587 for gmail, because the secure true and port 465 didn't work for me. i did a little bit of research and it seems to best use the oauth2 for gmail. but in my secure false using some gmail Apps password worked. try to make it work with secure true
const sendEmail = async (options) => {
  // note: to use gmail service the host is smtp.gmail.com
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    // todo: check are these two numbers for gmail? or all other services?
    port: process.env.SMTP_PORT, // ! if secure is false, port is 587 and if secure is true, port is 465.
    secure: process.env.SMTP_SECURE === "true", // !true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // todo: is using await before sending emails matter? search for it
  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
