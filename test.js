const { faker, fakerEN_IN } = require('@faker-js/faker');

const getSignalQuality = (rsrp) => {

  faker.locale = 'en_IND';

  if (rsrp >= -104) return "Good";
  if (rsrp >= -110) return "Moderate";
  return "Poor";
};
const generateBroadbandStatus = () => {



  const voucherCode = `EXO-${faker.string.alphanumeric(6).toUpperCase()}`;
  const voucherAmount = `₹${faker.finance.amount(50, 500, 0)}`;
  const expiryDate = faker.date.soon({ days: 30 }).toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const message = `🎉 Voucher issued successfully! Code "${voucherCode}" worth ${voucherAmount} has been added to user's account. Valid till ${expiryDate}.`;


  return {
    message,
    voucher: {
      code: voucherCode,
      amount: voucherAmount,
      issuedAt: new Date().toISOString(),
      validTill: expiryDate
    }
  }
};


const res = generateBroadbandStatus("12345")
console.log(res);