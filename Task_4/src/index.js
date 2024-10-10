// index.js

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
// Connect to MongoDB
mongoose.connect('mongodb+srv://nodejsboy:nodejsboy@cluster0.rlojvly.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/productdb', {
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

// API endpoint for bar chart data based on price ranges for a selected month
app.get('/barchart', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ error: 'Month is required' });
  }

  try {
    // Prepare the month filter
    const monthNumber = new Date(Date.parse(month + " 1")).getMonth() + 1;

    // Define price ranges
    const priceRanges = [
      { range: '0 - 100', min: 0, max: 100 },
      { range: '101 - 200', min: 101, max: 200 },
      { range: '201 - 300', min: 201, max: 300 },
      { range: '301 - 400', min: 301, max: 400 },
      { range: '401 - 500', min: 401, max: 500 },
      { range: '501 - 600', min: 501, max: 600 },
      { range: '601 - 700', min: 601, max: 700 },
      { range: '701 - 800', min: 701, max: 800 },
      { range: '801 - 900', min: 801, max: 900 },
      { range: '901 - above', min: 901, max: Infinity },
    ];

    // Initialize an array to hold the counts for each range
    const rangeCounts = priceRanges.map(range => ({
      range: range.range,
      count: 0
    }));

    // Count the number of items in each price range for the specified month
    const products = await Product.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, monthNumber]
      }
    });

    products.forEach(product => {
      const price = product.price;

      // Determine which range the price falls into
      for (let i = 0; i < rangeCounts.length; i++) {
        if (price >= rangeCounts[i].min && price <= rangeCounts[i].max) {
          rangeCounts[i].count++;
          break;
        }
      }
    });

    res.status(200).json(rangeCounts);
  } catch (error) {
    console.error('Error retrieving bar chart data:', error);
    res.status(500).json({ error: 'Failed to retrieve bar chart data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
