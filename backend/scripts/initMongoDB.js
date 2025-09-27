const { connectDB, mongoose } = require('../config/db');
const { Customer } = require('../models/customerModel');
const { Tuition } = require('../models/tuitionModel');
const { Payment } = require('../models/paymentModel');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Initializing MongoDB database with new ERD structure...');
    
    // Clear existing data (optional - remove in production)
    await Customer.deleteMany({});
    await Tuition.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data');
    
    // Create sample customers
    const sampleCustomers = [
      {
        customer_id: 'CUST001',
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        full_name: 'Administrator',
        phone_number: '0123456789',
        email: 'admin@example.com',
        address: '123 Admin Street',
        available_balance: 50000000
      },
      {
        customer_id: 'CUST002',
        username: 'user1',
        password: bcrypt.hashSync('user123', 10),
        full_name: 'Nguyen Van A',
        phone_number: '0987654321',
        email: 'user1@example.com',
        address: '456 User Street',
        available_balance: 25000000
      },
      {
        customer_id: 'CUST003',
        username: 'khang',
        password: bcrypt.hashSync('khang123', 10),
        full_name: 'Dang Bao Khang',
        phone_number: '0901234567',
        email: '522H0003@student.edu.vn',
        address: 'HCMC',
        available_balance: 20000000
      },
      {
        customer_id: 'CUST004',
        username: 'minh',
        password: bcrypt.hashSync('123123', 10),
        full_name: 'Hoang Van Minh',
        phone_number: '0901234567',
        email: 'vamila2710@gmail.com',
        address: 'HCMC',
        available_balance: 60000000
      }
    ];
    
    await Customer.insertMany(sampleCustomers);
    console.log('Created sample customers');
    
    // Create sample tuition fees
    const sampleTuitions = [
      {
        tuition_fee_id: 'TUI001',
        student_id: '522H0003',
        student_name: 'Dang Bao Khang',
        semester: 'HK1',
        academic_year: '2024-2025',
        tuition_amount: 15000000,
        due_date: new Date('2024-12-31'),
        status: 'UNPAID'
      },
      {
        tuition_fee_id: 'TUI002',
        student_id: '522H0028',
        student_name: 'Le Nguyen Minh Kha',
        semester: 'HK1',
        academic_year: '2024-2025',
        tuition_amount: 12000000,
        due_date: new Date('2024-12-31'),
        status: 'UNPAID'
      },
      {
        tuition_fee_id: 'TUI003',
        student_id: '522H0020',
        student_name: 'Hoang Van Minh',
        semester: 'HK1',
        academic_year: '2024-2025',
        tuition_amount: 18000000,
        due_date: new Date('2024-12-31'),
        status: 'UNPAID'
      },
      {
        tuition_fee_id: 'TUI004',
        student_id: '522H0003',
        student_name: 'Dang Bao Khang',
        semester: 'HK2',
        academic_year: '2024-2025',
        tuition_amount: 16000000,
        due_date: new Date('2025-05-31'),
        status: 'UNPAID'
      }
    ];
    
    await Tuition.insertMany(sampleTuitions);
    console.log('Created sample tuition fees');
    
    console.log('Database initialization completed successfully!');
    
    // Display sample data
    console.log('\n=== Sample Customers ===');
    const customers = await Customer.find({}, { password: 0 });
    customers.forEach(customer => {
      console.log(`ID: ${customer.customer_id}, Username: ${customer.username}, Name: ${customer.full_name}, Balance: ${customer.available_balance}`);
    });
    
    console.log('\n=== Sample Tuition Fees ===');
    const tuitions = await Tuition.find({});
    tuitions.forEach(tuition => {
      console.log(`Fee ID: ${tuition.tuition_fee_id}, Student: ${tuition.student_name} (${tuition.student_id}), Amount: ${tuition.tuition_amount}, Status: ${tuition.status}`);
    });
    
    console.log('\n=== Payment Records ===');
    const payments = await Payment.find({});
    if (payments.length > 0) {
      payments.forEach(payment => {
        console.log(`Payment ID: ${payment.payment_id}, Customer: ${payment.customer_id}, Tuition: ${payment.tuition_fee_id}, Amount: ${payment.amount}, Status: ${payment.status}`);
      });
    } else {
      console.log('No payment records yet');
    }
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the initialization
initializeDatabase();