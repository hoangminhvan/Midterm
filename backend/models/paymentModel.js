const { mongoose } = require('../config/db');
const paymentSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20
  },
  customer_id: {
    type: String,
    required: true,
    maxlength: 20
  },
  tuition_fee_id: {
    type: String,
    required: true,
    maxlength: 20
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']
  },
  message: {
    type: String,
    maxlength: 200,
    default: ''
  }
}, {
  timestamps: true
});


// Index để tối ưu hóa truy vấn
paymentSchema.index({ customer_id: 1 });
paymentSchema.index({ tuition_fee_id: 1 });
paymentSchema.index({ payment_date: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

// Tạo payment ID tự động
async function generatePaymentId() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Payment.countDocuments({
    payment_id: { $regex: `^PAY${dateStr}` }
  });
  return `PAY${dateStr}${String(count + 1).padStart(4, '0')}`;
}

async function createPayment(customerId, tuitionFeeId, amount, message = '') {
  const paymentId = await generatePaymentId();

  const payment = new Payment({
    payment_id: paymentId,
    customer_id: customerId,
    tuition_fee_id: tuitionFeeId,
    amount,
    message, 
    status: 'PENDING'
  });

  await payment.save();
  return { paymentId };
}


async function completePayment(paymentId) {
  return await Payment.findOneAndUpdate(
    { payment_id: paymentId },
    { status: 'COMPLETED' },
    { new: true }
  );
}

async function getPaymentById(paymentId) {
  return await Payment.findOne({ payment_id: paymentId });
}

async function getPaymentsByCustomer(customerId) {
  return await Payment.find({ customer_id: customerId }).sort({ payment_date: -1 });
}

async function getPaymentsByTuition(tuitionFeeId) {
  return await Payment.find({ tuition_fee_id: tuitionFeeId }).sort({ payment_date: -1 });
}

module.exports = { 
  Payment, 
  createPayment, 
  completePayment, 
  getPaymentById, 
  getPaymentsByCustomer, 
  getPaymentsByTuition 
};