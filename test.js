const { faker, fakerEN_IN } = require('@faker-js/faker');

const getSignalQuality = (rsrp) => {

    faker.locale = 'en_IND';
    
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
  
    const isSpecialCustomer = customerId === "12345";
  
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
  
  
const res = generateBroadbandStatus("12345")
console.log(res);