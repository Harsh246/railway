const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const router = express.Router();

// Helper function to generate mock customer and order details
const generateMockDetails = () => ({
  customerId: faker.string.uuid(),
  customerName: faker.person.fullName(),
  mobileNumber: faker.phone.number('+91 ##########'),
  email: faker.internet.email(),
  deliveryAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`,
  accountCreatedDate: faker.date.past({ years: 5 }).toISOString(),
  orders: Array.from({
    length: faker.number.int({ min: 1, max: 5 })
  }).map(() => ({
    orderId: faker.string.uuid(),
    orderDate: faker.date.past().toISOString(),
    orderStatus: faker.helpers.arrayElement(['Delivered', 'Not Delivered']),
    items: Array.from({
      length: faker.number.int({ min: 1, max: 10 })
    }).map(() => ({
      itemName: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: faker.commerce.price(),
    })),
    totalAmount: faker.commerce.price(),
  })),
  lastComplaint: faker.lorem.sentence(),
  loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
  tags: faker.helpers.arrayElements(['High Priority', 'VIP Customer', 'Frequent Returns'], 2),
  lastContacted: faker.helpers.arrayElement([
    faker.date.recent({ days: 1 }).toISOString(), // Within the last 24 hours
    faker.date.past().toISOString(), // An earlier random date
  ]),
});

// Endpoint to fetch customer details
router.get('/api/customer-details', (req, res) => {
  const { caseId } = req.query;

  // Validate input
  if (!caseId) {
    return res.status(400).json({ error: 'Please provide a caseId.' });
  }

  // Generate mock details dynamically
  const customerDetails = generateMockDetails();

  // Add specific identifier to make it clear which query fetched the data
  customerDetails.caseId = caseId;


  // Respond with the generated details
  res.json(customerDetails);
});

// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

module.exports = router;
