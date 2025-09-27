const express = require('express');
const router = express.Router();
const { login, getUserProfile } = require('../controllers/authController');
const { searchTuition, getTuitionById, createTuitionPayment, completeTuitionPayment } = require('../controllers/paymentController');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const { getPaymentsByCustomer } = require('../models/paymentModel'); 

// Middleware auth
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Authentication routes
router.post('/login', login);
router.get('/profile', authMiddleware, getUserProfile);

// Tuition routes
router.get('/tuition/student/:studentId', authMiddleware, searchTuition);
router.get('/tuition/:tuitionFeeId', authMiddleware, getTuitionById);

router.post('/tuition/create-payment', authMiddleware, createTuitionPayment);
router.post('/tuition/complete-payment', authMiddleware, completeTuitionPayment);

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.customerId; 
    const payments = await getPaymentsByCustomer(customerId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;