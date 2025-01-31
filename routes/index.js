const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const router = express.Router();

// Global state to track the current step in the loop
let callStep = 0; // Starts at 0: 0 -> Not Delivered, 1 -> Delivered (within 24h), 2 -> Delivered (not within 24h), 3 -> Delivered (lastContacted within 24h)

// Helper function to generate mock customer and order details
const generateMockDetails = () => {
  // Increment callStep and reset to 0 if it exceeds 3
  callStep = (callStep + 1) % 4;

  // Determine orderStatus, orderDate, and lastContacted based on the callStep
  let orderStatus, lastContacted, orderDate;
  if (callStep === 0) {
    orderStatus = 'Not Delivered';
    lastContacted = faker.date.past().toISOString(); // Random past date
    orderDate = faker.date.past().toISOString(); // Random past date
  } else if (callStep === 1) {
    orderStatus = 'Delivered';
    lastContacted = faker.date.recent({ days: 1 }).toISOString(); // Within the last 24 hours
    orderDate = faker.date.recent({ days: 1 }).toISOString(); // Order date also within 24 hours
  } else if (callStep === 2) {
    orderStatus = 'Delivered';
    lastContacted = faker.date.past().toISOString(); // Random earlier date (not within 24 hours)
    orderDate = faker.date.past().toISOString(); // Order date also past date
  } else if (callStep === 3) {
    orderStatus = 'Delivered';
    lastContacted = faker.date.recent({ days: 1 }).toISOString(); // Within the last 24 hours
    orderDate = faker.date.past().toISOString(); // Order date is older than 24 hours
  }

  return {
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
      orderDate: orderDate, // Use the determined orderDate
      orderStatus: orderStatus, // Use the determined orderStatus
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
    lastContacted: lastContacted, // Use the determined lastContacted
  };
};

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


const prepaidPlans = [
  { name: 'Hala Super Recharge 15', data: 1.5, voice: 60, price: 15 },
  { name: 'Hala Super Recharge 40', data: 6, voice: 150, price: 40 },
  { name: 'Hala Super Recharge 65', data: 14.2, voice: 276, price: 65 },
  { name: 'Hala Super Recharge 100', data: 23.4, voice: 460, price: 100 },
  { name: 'Hala Super Recharge 125', data: 26.85, voice: 575, price: 125 },
  { name: 'Hala Super Recharge 200', data: 41.8, voice: 1150, price: 200 },
];

const postpaidPlans = [
  { name: 'Shahry+ Go', data: 15, voice: 500, price: 140 },
  { name: 'Shahry+ Super', data: 25, voice: Infinity, price: 200 },
  { name: 'Shahry+ Social', data: 40, voice: Infinity, price: 250 },
];

// Counter to toggle between data and voice for usage simulation
let toggleCounter = 0;

// Helper function to recommend the best postpaid plan
const recommendPostpaidPlan = (dataUsage, voiceUsage) => {
  const suitablePlans = postpaidPlans.filter(
    (plan) => plan.data >= dataUsage || plan.voice >= voiceUsage
  );

  suitablePlans.sort((a, b) => a.price - b.price);
  return suitablePlans[0];
};

// Endpoint to fetch customer details and recommend a postpaid plan
router.get('/api/ooredoo/customer-details', (req, res) => {
  const { mobileNumber } = req.query;

  // Validate input
  if (!mobileNumber) {
    return res
      .status(400)
      .json({ error: 'Please provide a mobileNumber as a required parameter.' });
  }

  // Select a random prepaid plan for the customer
  const currentPlan = prepaidPlans[Math.floor(Math.random() * prepaidPlans.length)];

  // Simulate usage data
  toggleCounter++;

  // Alternate the usage for data and voice for each request
  let dataUsage, voiceUsage, highUsageReason;

  if (toggleCounter % 2 === 0) {
    // Simulate data usage exceeding limits
    dataUsage = faker.number.float({ min: currentPlan.data + 1, max: 50, fractionDigits: 1 });
    voiceUsage = faker.number.int({ min: 0, max: currentPlan.voice }); // Keep voice usage within the plan
    highUsageReason = 'Data usage exceeds current plan limits';
  } else {
    // Simulate voice usage exceeding limits
    voiceUsage = faker.number.int({ min: currentPlan.voice + 1, max: 1200 });
    dataUsage = faker.number.float({ min: 0, max: currentPlan.data }); // Keep data usage within the plan
    highUsageReason = 'Voice usage exceeds current plan limits';
  }

  // Recommend a postpaid plan
  const recommendedPlan = recommendPostpaidPlan(dataUsage, voiceUsage);

  // Response payload
  const response = {
    customerDetails: {
      mobileNumber,
      customerName: faker.name.fullName(),
      connectionType: 'Prepaid',
      currentPlan: currentPlan.name,
      planDetails: {
        dataLimit: `${currentPlan.data} GB`,
        voiceLimit: `${currentPlan.voice} minutes`,
      },
      usageDetails: {
        dataUsage: `${dataUsage.toFixed(1)} GB`,
        voiceUsage: `${voiceUsage} minutes`,
      },
      highUsage: {
        data: dataUsage > currentPlan.data,
        voice: voiceUsage > currentPlan.voice,
        reason: highUsageReason,
      },
    },
    recommendation: {
      suggestedPlan: recommendedPlan.name,
      planDetails: {
        dataLimit: `${recommendedPlan.data} GB`,
        voiceLimit: recommendedPlan.voice === Infinity ? 'Unlimited' : `${recommendedPlan.voice} minutes`,
        price: `QR ${recommendedPlan.price}/month`,
      },
    },
  };

  res.json(response);
});

// Endpoint to fetch full account holder details
router.get('/api/techm/customer/:mobileNumber', (req, res) => {
  const { mobileNumber } = req.params;

  // Validate input
  if (!mobileNumber) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  // Generate mock details
  const customerDetails = {
    fullName: faker.person.fullName(),
    address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}, ${faker.location.country()}, ${faker.location.zipCode()}`,
    mobileNumber,
    dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0], // Format: YYYY-MM-DD
    lastBillingAmount: `$${faker.finance.amount(10, 500, 2)}`, // Random billing amount
    lastPaymentMethod: faker.helpers.arrayElement(['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet']), // Random payment method

  };

  res.json(customerDetails);
});


// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

module.exports = router;
