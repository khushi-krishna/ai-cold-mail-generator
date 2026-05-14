const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text }) => {
  try {
    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev", // free tier sender
      to,
      subject,
      text,
    });

    if (error) throw new Error(error.message);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Error sending mail:", err.message);
    throw err;
  }
};

module.exports = sendEmail;
