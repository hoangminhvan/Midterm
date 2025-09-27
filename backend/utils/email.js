const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"iBanking" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2 style="color:#b30000;">iBanking OTP</h2>
        <p>Hello,</p>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:5px; color:#b30000;">${otp}</h1>
        <p>This otp will be expired in  <b>5 minutes</b>.</p>
        <p>Please do not share this otp to anyone</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${to}`);
  } catch (err) {
    console.error('❌ Error sending OTP email:', err);
    throw err;
  }
}


module.exports = { sendOtpEmail };