// index.js

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:8ZU3VNDfBezKJiVP@crud.xuh8kmc.mongodb.net/productdb', {
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

// API endpoint to initialize the database with data from the third-party API
app.get('/init-db', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const products = response.data;

    await Product.deleteMany(); // Clear existing data
    await Product.insertMany(products); // Insert new data

    res.status(200).json({ message: 'Database initialized successfully!' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// API endpoint for pie chart data based on unique categories for a selected month
app.get('/piechart', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: 'Month is required' });
  }

  try {
    // Prepare the month filter
    const monthNumber = new Date(Date.parse(month + " 1")).getMonth() + 1;

    // Aggregate products to find unique categories and their counts
    const categoryCounts = await Product.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$dateOfSale" }, monthNumber]
          }
        }
      },
      {
        $group: {
          _id: "$category", // Group by category
          count: { $sum: 1 } // Count items in each category
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default MongoDB _id field from the result
          category: "$_id", // Rename _id to category
          count: 1 // Include the count
        }
      }
    ]);

    res.status(200).json(categoryCounts);
  } catch (error) {
    console.error('Error retrieving pie chart data:', error);
    res.status(500).json({ error: 'Failed to retrieve pie chart data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
