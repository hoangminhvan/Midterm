const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findCustomerByUsername } = require('../models/customerModel');
const { sendOtpEmail } = require('../utils/email');
const { verifyOtp } = require('../models/paymentModel');
const dotenv = require('dotenv');
dotenv.config();

async function login(req, res) {
  const { username, password } = req.body;
  const customer = await findCustomerByUsername(username);
  if (!customer || !bcrypt.compareSync(password, customer.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ 
    customerId: customer.customer_id,
    customerObjectId: customer._id 
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ 
    token, 
    customer: { 
      customer_id: customer.customer_id,
      full_name: customer.full_name, 
      balance: customer.available_balance 
    } 
  });
}

async function verifyOtpController(req, res) {
  const { paymentId, otp, otpToken } = req.body;

  try {
    const decoded = jwt.verify(otpToken, process.env.OTP_SECRET);

    if (decoded.paymentId !== paymentId || decoded.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified', paymentId });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
}

async function getUserProfile(req, res) {
  const customerId = req.user.customerId;
  const customer = await findCustomerByUsername(req.user.username) || 
                  await require('../models/customerModel').findCustomerById(customerId);
  
  if (!customer) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    customer_id: customer.customer_id,
    full_name: customer.full_name,
    username: customer.username,
    phone_number: customer.phone_number,
    email: customer.email,
    address: customer.address,
    balance: customer.available_balance
  });
}

module.exports = { login, verifyOtpController, getUserProfile };