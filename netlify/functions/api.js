const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const Customer = require('../../models/customer');

const app = express();

app.use(cors());
app.use(express.json());

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect("mongodb+srv://shahid-anwaar:Bike6147@cluster0.v3fh1.mongodb.net/");
  return cachedConnection;
}

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Backend is running!' });
});

app.post('/api/add-customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    console.error('Add customer error:', err);
    res.status(400).json({ error: 'Failed to save customer data' });
  }
});

app.get('/api/get_customers_list', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ _id: -1 });
    res.status(200).json(customers);
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.put('/api/edit-customer/:id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(updatedCustomer);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.get('/api/get_single_customer_detail/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error('Get single customer error:', err);
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
    console.error('Delete customer error:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports.handler = serverless(app);