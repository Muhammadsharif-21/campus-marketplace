const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`[Email Service - Dev Mode] No EMAIL_USER/EMAIL_PASS configured. Email to ${to}:\nSubject: ${subject}\n${text || html}`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Campus Market" <${user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[Email Service] Message sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service] Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
