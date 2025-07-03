const express = require('express');
const { faker, fakerEN_GB, fakerEN_IN } = require('@faker-js/faker');
const path = require('path');
const router = express.Router();

const robin = {
  status: "Authenticated",
  sgsn: "Attached",
  balstatus: 500,
  loc: "5G Network Available",
  brand: "EE",
  ctype: "Consumer PAYM",
  anumber: "158159255",
  name: "Robin Kundra",
  postcode: "DL38NW",
  area: "Delhi", // Random area in India for Robin
  barring: "Not Data",
  roaming: "Enabled",
  llnumber: "Not Data",
  username: "610042995",
  idIdentified: "True",
  idValidated: "True",
  idValidationLeval: "High",
  manualmode: "False",
  customerRole: "Account Holder",
  loscotrialflag: "No",
  quickanswerflag: "Yes",
  subsplan: "PAYM",
  customertype: "Consumer",
  brand1: "EE(Consumer and Small Business)",
  hubValidated: "Yes",
  deviceName: "Samsung Galaxy Z Flip 5",
  networkType: "5G",
  connectivity: "Wifi, Bluetooth, NFC, Wifi Hotspot",
  camera: "12 MP",
  battery: "Li-Po 3700 mAh, non-removable",
  os: "Android 13, upgradable to Android 14, One UI 6",
  imei: 490154203467891,
  mobileNumber: "+91 76890 45678",
};

const munish = {
  status: "Authenticated",
  sgsn: "Attached",
  balstatus: 350,
  loc: "5G Network Available",
  brand: "EE",
  ctype: "Consumer PAYM",
  anumber: "158159255",
  name: "Munish Kumar",
  postcode: "DL38NW",
  area: "Mumbai", // Random area in India for Munish
  barring: "Not Data",
  roaming: "Enabled",
  llnumber: "Not Data",
  username: "610042995",
  idIdentified: "True",
  idValidated: "True",
  idValidationLeval: "High",
  manualmode: "False",
  customerRole: "Account Holder",
  loscotrialflag: "No",
  quickanswerflag: "Yes",
  subsplan: "PAYM",
  customertype: "Consumer",
  brand1: "EE(Consumer and Small Business)",
  hubValidated: "Yes",
  deviceName: "Apple iPhone 15",
  networkType: "5G",
  connectivity: "Wifi, Bluetooth, NFC, Wifi Hotspot",
  camera: "48 MP",
  battery: "Li-Ion 3300 mAh, non-removable",
  os: "iOS 17",
  imei: 869748213456789,
  mobileNumber: "+91 70123 45678",
};

const amit = {
  status: "Authenticated",
  sgsn: "Attached",
  balstatus: 4,
  loc: "5G Network Available",
  brand: "EE",
  ctype: "Consumer PAYM",
  anumber: "158159255",
  name: "Amit Kumar",
  postcode: "DL38NW",
  area: "Bangalore", // Random area in India for Amit
  barring: "Not Data",
  roaming: "Enabled",
  llnumber: "Not Data",
  username: "610042995",
  idIdentified: "True",
  idValidated: "True",
  idValidationLeval: "High",
  manualmode: "False",
  customerRole: "Account Holder",
  loscotrialflag: "No",
  quickanswerflag: "Yes",
  subsplan: "PAYM",
  customertype: "Consumer",
  brand1: "EE(Consumer and Small Business)",
  hubValidated: "Yes",
  deviceName: "Apple iPhone 15",
  networkType: "5G",
  connectivity: "Wifi, Bluetooth, NFC, Wifi Hotspot",
  camera: "48 MP",
  battery: "Li-Ion 3300 mAh, non-removable",
  os: "iOS 17",
  imei: 354840789345672,
  mobileNumber: "+91 90153 87546",
};

router.use(express.json());
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

  try {

    // Generate mock details
    const customerDetails = {
      fullName: faker.person.fullName(),
      address: `${fakerEN_GB.location.buildingNumber()} ${fakerEN_GB.location.street()}, ${fakerEN_GB.location.city()}, ${fakerEN_GB.location.county()}, United Kingdom, ${fakerEN_GB.location.zipCode()}`,
      mobileNumber,
      dateOfBirth: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0], // Format: YYYY-MM-DD
      lastBillingAmount: `$${faker.finance.amount(10, 500, 2)}`, // Random billing amount
      lastPaymentMethod: faker.helpers.arrayElement(['Credit Card', 'Debit Card', 'Net Banking', 'EMI', 'Wallet']), // Random payment method

    };

    res.json(customerDetails);
  } catch (err) {
    console.debug("🚀 ~ router.get ~ err:", err)
  }


});


// Function to generate a mock flight

// Function to generate a mock flight
const generateFlight = (daysAhead, departure = null, arrival = null, enforceStatus = false) => {
  return {
    flightNumber: `NK${faker.number.int({ min: 100, max: 999 })}`,
    departure: departure || `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    arrival: arrival || `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    departureTime: faker.date.soon({ days: daysAhead }).toISOString(),
    arrivalTime: faker.date.soon({ days: daysAhead, refDate: new Date(Date.now() + 2 * 60 * 60 * 1000) }).toISOString(),
    status: enforceStatus
      ? "Scheduled" // Ensures next flight is never delayed/canceled
      : faker.helpers.arrayElement(["On Time", "Delayed", "Cancelled"]),
    gate: `G${faker.number.int({ min: 1, max: 50 })}`,
  };
};

router.get('/api/spirit/flight/:mobileNumber', (req, res) => {
  const { mobileNumber } = req.params;

  // Validate input
  if (!mobileNumber) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  try {
    // Generate current flight
    const currentFlight = generateFlight(1);

    // Generate next flight with same departure & arrival, but a later date
    let nextFlight = generateFlight(3, currentFlight.departure, currentFlight.arrival, true);

    // Override if status was assigned as "Delayed" or "Cancelled"
    if (["Delayed", "Cancelled"].includes(nextFlight.status)) {
      nextFlight.status = "Scheduled";
    }

    const flightData = { currentFlight, nextFlight };

    res.json(flightData);
  } catch (err) {
    console.error(`🚀 ~ Error fetching flight details for ${mobileNumber}:`, err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


const generateCIBILDetails = () => {
  return {
    cibilScore: faker.number.int({ min: 300, max: 900 }),
    creditUtilization: faker.number.float({ min: 10, max: 90, precision: 0.1 }) + "%",
    totalAccounts: faker.number.int({ min: 2, max: 15 }),
    activeLoans: faker.number.int({ min: 0, max: 5 }),
    creditCardLimit: `$${faker.number.int({ min: 500, max: 10000 }).toLocaleString()}`,
    lastPaymentDate: faker.date.recent({ days: 60 }).toISOString().split("T")[0],
    missedPayments: faker.number.int({ min: 0, max: 5 }),
    creditAge: faker.number.int({ min: 1, max: 20 }) + " years",
    remarks: faker.helpers.arrayElement([
      "Good repayment history",
      "High credit utilization",
      "Low credit age",
      "No missed payments",
      "Recent loan inquiries detected",
    ]),
  };
};


router.get("/api/cibil/soft-pull/:mobileNumber", (req, res) => {
  const { mobileNumber } = req.params;


  res.json({
    mobileNumber,
    inquiryType: "Soft Pull",
    fetchedAt: new Date().toISOString(),
    ...generateCIBILDetails(),
  });
});



const IPL_TEAMS = ["DC", "SRH", "RCB", "MI", "CSK", "KKR", "PBKS", "RR", "LSG", "GT"];

// Function to generate deterministic fake data based on taskId
const generateTaskStats = (taskId) => {
  const seed = parseInt(taskId, 36) % 1000;
  faker.seed(seed);

  const seriesCount = faker.number.int({ min: 10, max: 50 });
  const totalMatches = faker.number.int({ min: 100, max: 500 });
  const totalContests = faker.number.int({ min: 200, max: 1000 });
  const winRate = faker.number.int({ min: 30, max: 70 });

  const recentMatches = Array.from({ length: faker.number.int({ min: 5, max: 10 }) }, () => {
    const team1 = faker.helpers.arrayElement(IPL_TEAMS);
    let team2 = faker.helpers.arrayElement(IPL_TEAMS);
    while (team1 === team2) team2 = faker.helpers.arrayElement(IPL_TEAMS);

    const isRuns = faker.datatype.boolean();
    const margin = isRuns
      ? `${faker.number.int({ min: 1, max: 100 })} runs`
      : `${faker.number.int({ min: 1, max: 10 })} wickets`;

    const winner = faker.datatype.boolean() ? team1 : team2;
    const loser = winner === team1 ? team2 : team1;

    return {
      matchId: faker.string.uuid(),
      team1,
      team2,
      winner,
      loser,
      margin,
      date: faker.date.recent({ days: 30 }).toISOString(),
      status: faker.datatype.boolean() ? "Completed" : "Pending",
      pointsScored: faker.number.float({ min: 400, max: 800 }),
      tournamentType: faker.helpers.arrayElement(["T1", "T10", "T20"]),
      teamsCreated: faker.number.int({ min: 1, max: 5 }),
      dreamTeamScore: faker.number.float({ min: 500, max: 1300 }),
      winnings: {
        amount: faker.number.int({ min: 0, max: 5000 }),
        creditType: faker.helpers.arrayElement(["FPV", "Direct"]),
      },
      joined: faker.datatype.boolean(),
      won: faker.datatype.boolean(),
    };
  });

  return {
    seriesCount,
    totalMatches,
    totalContests,
    winRate,
    recentMatches,
  };
}

router.get('/api/fantasy-stats/:taskId', (req, res) => {
  const { taskId } = req.params;
  if (!taskId) {
    return res.status(400).json({ error: "Task ID is required" });
  }

  const stats = generateTaskStats(taskId);
  res.json(stats);
});



const getSignalQuality = (rsrp) => {


  if (rsrp >= -104) return "Good";
  if (rsrp >= -110) return "Moderate";
  return "Poor";
};
const generateBroadbandStatus = (customerId) => {
  const seed = parseInt(customerId, 36) % 1000;
  faker.seed(seed);

  const rsrp = faker.number.float({ min: -120, max: -95, fractionDigits: 1 });

  const indianLocations = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'New Delhi', state: 'Delhi' },
    { city: 'Lucknow', state: 'Uttar Pradesh' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'Chandigarh', state: 'Punjab' },
    { city: 'Jaipur', state: 'Rajasthan' },
    { city: 'Kochi', state: 'Kerala' },
    { city: 'Hyderabad', state: 'Telangana' },
  ];

  const loc = indianLocations[Math.floor(Math.random() * indianLocations.length)];

  const isSpecialCustomer = customerId === "12345" || "1234";

  return {
    customerId,
    customerDetails: {
      name: fakerEN_IN.name.fullName(),
      mobileNumber: fakerEN_IN.phone.number("+91-9#######00"),
      address: `${faker.number.int({ min: 1, max: 999 })}, ${faker.location.street()}, ${loc.city}, ${loc.state}, India`
    },
    connectionStatus: isSpecialCustomer ? "Active" : faker.helpers.arrayElement(["Active", "Inactive"]),
    connectionType: isSpecialCustomer ? "Postpaid" : faker.helpers.arrayElement(["Prepaid", "Postpaid"]),
    ocsStatus: isSpecialCustomer ? "Active" : faker.helpers.arrayElement(["Active", "Not Active"]),
    signalInfo: {
      rsrpLevel: rsrp,
      signalQuality: getSignalQuality(rsrp)
    },
    deviceInfo: {
      deviceModel: faker.helpers.arrayElement(["Zyxel VMG3925", "Huawei HG8145V5", "Nokia G-240W-C"]),
      firmwareVersion: "v" + faker.system.semver(),
      lastOnline: faker.date.recent({ days: 2 }).toISOString()
    },
    networkInfo: {
      cellId: faker.string.alphanumeric(8),
      frequencyBand: faker.helpers.arrayElement(["1800 MHz", "2300 MHz", "700 MHz"]),
      lastReboot: faker.date.recent({ days: 5 }).toISOString(),
      currentSpeedMbps: faker.number.float({ min: 5, max: 100, fractionDigits: 1 })
    }
  };
};


router.get('/api/broadband/signal-status/:customerId', (req, res) => {
  const { customerId } = req.params;
  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  const data = generateBroadbandStatus(customerId);
  res.json(data);
});

// Endpoint to fetch order status for food available in India
router.get('/api/exotel/order-status/:orderId', (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required.' });
  }

  try {
    const trendingIndiaFoods = [
      'Cheese Burst Margherita Pizza',
      'Chicken Tikka Wrap',
      'Veg Supreme Burger',
      'Chocolate Boba Milk Tea',
      'Peri Peri Fries',
      'Chicken Momos',
      'Butter Chicken Rice Bowl',
      'Schezwan Paneer Noodles',
      'Crispy Chicken Sandwich',
      'Hazelnut Cold Coffee',
      'Tandoori Chicken Loaded Fries',
      'Belgian Chocolate Waffle',
      'Chilli Garlic Maggi',
      'Iced Americano',
      'Fried Chicken Bucket',
      'Spicy Mexican Tacos',
      'Korean BBQ Wings',
      'Red Velvet Cupcake',
      'Thick Oreo Shake',
      'Pasta Alfredo with Garlic Bread'
    ];

    const items = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
      const name = faker.helpers.arrayElement(trendingIndiaFoods);
      return {
        name,
        quantity: faker.number.int({ min: 1, max: 3 }),
        price: `₹${faker.finance.amount(80, 450, 0)}`
      };
    });

    const totalAmount = items.reduce((sum, item) => {
      return sum + parseInt(item.price.replace('₹', ''), 10) * item.quantity;
    }, 0);

    const orderStatus = {
      orderId,
      status: faker.helpers.arrayElement(['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']),
      restaurantName: faker.helpers.arrayElement([
        'Burger Singh',
        'Domino’s',
        'Behrouz Biryani',
        'The Belgian Waffle Co.',
        'Chaayos',
        'Barbeque Nation Express',
        'McDonald’s',
        'Starbucks',
        'Box8',
        'Wow! Momo'
      ]),
      items,
      totalAmount: `₹${totalAmount}`,
      estimatedDeliveryTime: faker.date.soon({ days: 1 }).toISOString(),
      deliveryAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, India`
    };

    res.json(orderStatus);
  } catch (err) {
    console.error("🚨 Error fetching order status:", err);
    res.status(500).json({ error: 'Failed to fetch order status.' });
  }
});


// Endpoint to issue a voucher to customer account
router.post('/api/exotel/issue-voucher', (req, res) => {
  const { mobileNumber, fullName } = req.body;

  if (!mobileNumber || !fullName) {
    return res.status(400).json({ error: 'Full name and mobile number are required.' });
  }

  try {
    const voucherCode = `EXO-${faker.string.alphanumeric(6).toUpperCase()}`;
    const voucherAmount = `₹${faker.finance.amount(500, 2500, 0)}`;
    const expiryDate = faker.date.soon({ days: 30 }).toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const message = `🎉 Voucher issued successfully! Code "${voucherCode}" worth ${voucherAmount} has been added to user's account. Valid till ${expiryDate}.`;

    res.json({
      message,
      mobileNumber,
      voucher: {
        code: voucherCode,
        amount: voucherAmount,
        issuedAt: new Date().toISOString(),
        validTill: expiryDate
      }
    });
  } catch (err) {
    console.error("🚨 Error issuing voucher:", err);
    res.status(500).json({ error: 'Failed to issue voucher.' });
  }
});


router.get("/api/internet/:id", (req, res) => {
  const id = req.params.id // ensure it's a number

  let data = munish;

  if (id === '1234567890') {
    data = amit;
  } else if (id === '0987654321') {
    data = robin;
  }
  data.mobileNumber = id

  res.json(data);
});






const generateCustomerInfo = (identifier) => {
  const seed = parseInt(identifier.replace(/\D/g, ""), 10) || 999;
  faker.seed(seed);

  // Known, real US cities with state + ZIP patterns
  const cityData = [
    { city: "Los Angeles", state: "California", zipPrefix: "90" },
    { city: "Dallas", state: "Texas", zipPrefix: "75" },
    { city: "Chicago", state: "Illinois", zipPrefix: "60" },
    { city: "Miami", state: "Florida", zipPrefix: "33" },
    { city: "New York", state: "New York", zipPrefix: "10" },
  ];
  const selected = faker.helpers.arrayElement(cityData);

  return {
    name: faker.person.fullName(),
    address: `${faker.location.streetAddress()}, ${selected.city}, ${selected.state} ${selected.zipPrefix}${faker.number.int({ min: 100, max: 999 })}`,
    accountStatus: faker.helpers.arrayElement(["Active", "Inactive", "Suspended"]),
    services: faker.helpers.arrayElements(["Internet", "Phone", "TV"], { min: 1, max: 3 }),
    devices: faker.helpers.arrayElements(["T-Mobile Gateway", "SIM Card", "Set-top box", "Router"], { min: 1, max: 3 }),
    notes: faker.helpers.arrayElement([
      "Customer recently upgraded their plan.",
      "Reported signal issues last week.",
      "No contact in the last 30 days.",
      "Scheduled for a service visit.",
      "Has an active support ticket pending resolution."
    ]),
  };
};


router.get("/api/customer/:identifier", (req, res) => {
  const { identifier } = req.params;
  const data = generateCustomerInfo(identifier);
  res.json(data);
});

const simulateRestart = (accountNumber) => {
  const seed = parseInt(accountNumber.replace(/\D/g, ""), 10) || 500;
  faker.seed(seed);

  const rebootStatus = faker.helpers.arrayElement(["In Progress", "Failed", "Completed"]);
  const eta = faker.date.soon({ days: 0.01 }); // in a few minutes

  return {
    status: rebootStatus,
    estimatedSLA: `${faker.number.int({ min: 1, max: 5 })} minutes`,
    startedAt: new Date().toISOString(),
    expectedCompletion: eta.toISOString(),
    message: rebootStatus === "Failed" ? "System timeout. Please try again." : "Restart request acknowledged.",
  };
};



const generateRecentCases = (identifier) => {
  const seed = parseInt(identifier.replace(/\D/g, ""), 10) || 1000;
  faker.seed(seed);

  return Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, (_, i) => ({
    caseId: `SR-${faker.string.alphanumeric(6).toUpperCase()}`,
    issueDate: faker.date.recent({ days: 30 }).toISOString().split("T")[0],
    description: faker.lorem.sentence(),
    troubleshootingSteps: faker.lorem.sentences(2),
    resolution: faker.helpers.arrayElement(["Pending", "In Progress", "Resolved"]),
  }));
};

router.get("/api/customer/:identifier/recent-cases", (req, res) => {
  const { identifier } = req.params;
  const cases = generateRecentCases(identifier);
  res.json(cases);
});


router.get("/api/system-central/restart", (req, res) => {
  const { accountNumber } = req.body;
  const result = simulateRestart(accountNumber);
  res.json(result);
});



// Serve the index.html file for the root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});


module.exports = router;
