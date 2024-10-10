// index.js

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://abhishekbhonde567:1qMjgGxZQlq39jYz@cluster0.uro5x.mongodb.net', {
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

// API endpoint to initialize the database
app.get('/init-db', async (req, res) => {
  try {
    // Fetch data from the third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const products = response.data;

    // Insert data into the database
    await Product.deleteMany(); // Clear the existing data
    await Product.insertMany(products); // Insert the new data

    res.status(200).json({ message: 'Database initialized successfully!' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
