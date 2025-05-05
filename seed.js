const mongoose = require('mongoose');
const Customer = require('./models/Customer');

mongoose.connect('mongodb://localhost:27017/customerDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const customerData = {
  id: 2,
  name: "Ali Raza",
  contact: "+92 301-9876543",
  address: "123 Mall Road, Lahore, Pakistan",
  image: "",
  col_time: "11:30 AM",
  last_date: "2025-04-20",
  items: 3,
  status: "Completed",
  kameez: 42,
  bazoo: 31,
  teera: 21,
  gla: 52,
  chati: 86,
  kmr: 420,
  geera: 20,
  shalwar: 900,
  pancha: 20,
  front: 0,
  side: 2,
  zip: 0,
  colr: false,
  ban: true,
  kaf: false,
  pleat: true
};

Customer.create(customerData)
  .then(() => {
    console.log('Customer inserted successfully');
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error('Error inserting customer:', error);
  });
