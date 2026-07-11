const mongoose = require("mongoose");
const Customer = require("../models/customer");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createNewCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({
      adminId: req.admin._id,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      isNotify: req.body.isNotify,
      measurements: req.body.measurements || {},
      lastUpdated: new Date(),
    });

    res.status(201).json({
      status: 201,
      customer
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create customer",
    });
  }
};

exports.getAllCustomersList = async (req, res) => {
  try {
    const customers = await Customer.find({
      adminId: req.admin._id,
      isDeleted: false,
    }).sort({ name: 1 });

    res.status(200).json({
      status: 200,
      customers
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customers",
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer id",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customer",
    });
  }
};

exports.updateCustomerById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer id",
      });
    }

    const updateData = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      isNotify: req.body.isNotify,
    };

    if (req.body.measurements) {
      updateData.measurements = req.body.measurements;
      updateData.lastUpdated = new Date();
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        adminId: req.admin._id,
        isDeleted: false,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      status: 200,
      customer
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

exports.deleteCustomerById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid customer id",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        adminId: req.admin._id,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};