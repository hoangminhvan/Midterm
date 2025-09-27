const { findTuitionByStudentId, findTuitionById, updateTuitionStatus } = require('../models/tuitionModel');
const { createPayment, completePayment, getPaymentById } = require('../models/paymentModel');
const { updateBalance, findCustomerById } = require('../models/customerModel');
const { sendOtpEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

async function searchTuition(req, res) {
  const { studentId } = req.params;
  const tuitions = await findTuitionByStudentId(studentId);
  if (!tuitions || tuitions.length === 0) {
    return res.status(404).json({ message: 'No tuition found for this student or invalid StudentId' });
  }
  res.json(tuitions);
}

async function getTuitionById(req, res) {
  const { tuitionFeeId } = req.params;
  const tuition = await findTuitionById(tuitionFeeId);
  if (!tuition) {
    return res.status(404).json({ message: 'Tuition not found' });
  }
  res.json(tuition);
}

async function createTuitionPayment(req, res) {
  const { tuitionFeeId } = req.body;
  const { messageTransaction } = req.body;
  const customerId = req.user.customerId;
  console.log(tuitionFeeId);
  const customer = await findCustomerById(customerId);
  const tuition = await findTuitionById(tuitionFeeId);
  
  if (!tuition) {
    return res.status(404).json({ message: 'Tuition not found' });
  }
  
  if (tuition.status === 'PAID') {
    return res.status(400).json({ message: 'Tuition already paid' });
  }
  
  if (customer.available_balance < tuition.tuition_amount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  const { paymentId } = await createPayment(customerId, tuitionFeeId, tuition.tuition_amount,messageTransaction);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpToken = jwt.sign(
    { otp, paymentId },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );

  await sendOtpEmail(customer.email, otp);

  res.json({ 
    paymentId,
    otpToken, 
    message: 'OTP sent to your email',
    tuition: {
      tuition_fee_id: tuition.tuition_fee_id,
      student_name: tuition.student_name,
      amount: tuition.tuition_amount
    }
  });
}

async function completeTuitionPayment(req, res) {
  const { paymentId, otp, otpToken } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(400).json({ message: 'OTP expired or invalid' });
  }

  if (decoded.paymentId !== paymentId || decoded.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  const payment = await getPaymentById(paymentId);
  if (!payment || payment.status !== 'PENDING') {
    return res.status(400).json({ message: 'Invalid payment' });
  }

  const completedPayment = await completePayment(paymentId);
  
  await updateBalance(payment.customer_id, payment.amount);
  
  await updateTuitionStatus(payment.tuition_fee_id, 'PAID');
  
  const tuition = await findTuitionById(payment.tuition_fee_id);
  
  const invoice = {
    paymentId: payment.payment_id,
    studentName: tuition.student_name,
    studentId: tuition.student_id,
    tuitionFeeId: payment.tuition_fee_id,
    amount: payment.amount,
    message:payment.message,
    paymentDate: payment.payment_date,
    status: 'Success'
  };

  res.json({ invoice });
}

module.exports = { searchTuition, getTuitionById, createTuitionPayment, completeTuitionPayment };