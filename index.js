const express = require('express');
const cors = require('cors');
const app = express();
const mongoString = "mongodb+srv://shahid-anwaar:Bike6147@cluster0.v3fh1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const mongoose = require('mongoose');

mongoose.connect(mongoString)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));


// const User = require('./models/customer');

// app.post('/api/users', async (req, res) => {
//   const { name, email } = req.body;
//   const user = new User({ name, email });
//   await user.save();
//   res.status(201).send(user);
// });



const Customer = require('./models/customer');

// add customer
app.post('/api/add-customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).send(customer);
  } catch (err) {
    console.error(err);
    res.status(400).send({ error: 'Failed to save customer data' });
  }
});

// Get list of customer
app.get('/api/get_customers_list', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ _id: -1 }); // optional: newest first
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// update a customer
app.put('/api/edit-customer/:id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return the updated document
    );
    res.status(200).json(updatedCustomer);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// get single customer detail
app.get('/api/get_single_customer_detail/:id', async (req, res) => {
  console.log("called by ", req, res);
  
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});


app.delete('/api/del_customer/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

