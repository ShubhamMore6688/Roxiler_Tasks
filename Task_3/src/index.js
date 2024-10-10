// index.js

const express = require('express');
const axios = require('axios')
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors())
// Connect to MongoDB
await mongoose.connect('mongodb+srv://admin:8ZU3VNDfBezKJiVP@crud.xuh8kmc.mongodb.net/productdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a product schema
const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date,
});

// Create a model based on the schema
const Product = mongoose.model('Product', productSchema);


// API endpoint for statistics based on a selected month
app.get('/statistics', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: 'Month is required' });
  }

  try {
    // Prepare the month filter
    const monthNumber = new Date(Date.parse(month + " 1")).getMonth() + 1;

    // Calculate total sale amount, sold items, and not sold items
    const totalSaleAmount = await Product.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber]
          },
          sold: true
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$price" }
        }
      }
    ]);

    const totalSoldItems = await Product.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber]
      },
      sold: true
    });

    const totalNotSoldItems = await Product.countDocuments({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber]
      },
      sold: false
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
