// index.js

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
// Connect to MongoDB
mongoose.connect('mongodb+srv://nodejsboy:nodejsboy@cluster0.rlojvly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/newDb', {
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

// API endpoint to list transactions with search and pagination
// API endpoint to list transactions with search and pagination
app.get('/transactions', async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
  
    // Ensure that page and perPage are positive integers
    const pageNumber = Math.max(1, Number(page)); // Default to 1 if less than 1
    const perPageNumber = Math.max(1, Number(perPage)); // Ensure perPage is at least 1
  
    try {
      // Prepare query to filter based on month if provided
      const dateFilter = month ? { 
        $expr: { 
          $eq: [{ $month: "$dateOfSale" }, new Date(Date.parse(month + " 1")).getMonth() + 1] 
        }
      } : {};
  
      // Build a search query
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ]
      };
  
      // Combine the filters
      const filter = { ...dateFilter, ...searchQuery };
  
      // Paginate results
      const transactions = await Product.find(filter)
        .skip((pageNumber - 1) * perPageNumber) // Skip records for pagination
        .limit(perPageNumber); // Limit records per page
  
      const totalCount = await Product.countDocuments(filter); // Get total count of matching documents
  
      // Respond with the results
      res.status(200).json({
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / perPageNumber),
        totalRecords: totalCount,
        transactions,
      });
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  });
  
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
