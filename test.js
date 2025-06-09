const { faker, fakerEN_IN } = require('@faker-js/faker');

const getSignalQuality = (rsrp) => {

  faker.locale = 'en_IND';

  if (rsrp >= -104) return "Good";
  if (rsrp >= -110) return "Moderate";
  return "Poor";
};
const generateBroadbandStatus = (orderId) => {
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


  return orderStatus
};


const res = generateBroadbandStatus("12345")
console.log(res);