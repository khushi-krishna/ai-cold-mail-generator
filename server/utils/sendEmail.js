const nodemailer = require('nodemailer');
const dns = require('dns');

// ✅ Force IPv4 (fixes your exact error)
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not set in env file.');
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
       
      tls: {
        rejectUnauthorized: false   // ✅ fix for your error
      }
    });

    // ✅ Check connection before sending
    await transporter.verify();
    console.log("SMTP connected");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: `<p>${options.text}</p>`
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");

  } catch (error) {
    console.log("Error sending mail:", error.message);
    throw error;
  }
};

module.exports = sendEmail;