const express = require('express');
const { faker } = require('@faker-js/faker');
const router = express.Router();

// Helper function to generate mock customer and order details
const generateMockDetails = () => ({
  customerId: faker.datatype.uuid(),
  customerName: faker.name.fullName(),
  mobileNumber: faker.phone.number('+91 ##########'),
  email: faker.internet.email(),
  deliveryAddress: faker.address.streetAddress() + ', ' + faker.address.city() + ', ' + faker.address.country(),
  accountCreatedDate: faker.date.past(5).toISOString(),
  orders: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }).map(() => ({
    orderId: faker.datatype.uuid(),
    orderDate: faker.date.past().toISOString(),
    orderStatus: faker.helpers.arrayElement(['Delivered', 'Pending', 'Canceled']),
    items: Array.from({ length: faker.datatype.number({ min: 1, max: 10 }) }).map(() => ({
      itemName: faker.commerce.productName(),
      quantity: faker.datatype.number({ min: 1, max: 5 }),
      price: faker.commerce.price(),
    })),
    totalAmount: faker.commerce.price(),
  })),
  lastComplaint: faker.lorem.sentence(),
  loyaltyPoints: faker.datatype.number({ min: 0, max: 1000 }),
  tags: faker.helpers.arrayElements(['High Priority', 'VIP Customer', 'Frequent Returns'], 2),
});

// Endpoint to fetch customer details
router.get('/api/customer-details', (req, res) => {
  const { orderId, mobileNumber } = req.query;

  // Validate input
  if (!orderId && !mobileNumber) {
    return res.status(400).json({ error: 'Please provide either an orderId or a mobileNumber.' });
  }

  // Generate mock details dynamically
  const customerDetails = generateMockDetails();

  // Add specific identifier to make it clear which query fetched the data
  if (mobileNumber) {
    customerDetails.mobileNumber = mobileNumber;
  }
  if (orderId) {
    customerDetails.orders[0].orderId = orderId; // Attach the orderId to one of the mock orders
  }

  // Respond with the generated details
  res.json(customerDetails);
});

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

module.exports = router;
