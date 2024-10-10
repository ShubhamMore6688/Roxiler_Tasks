// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('March');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const perPage = 10;
 
  
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchTransactions();
  }, [month, page, searchTerm]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/transactions', {
        params: {
          month,
          page,
          perPage,
          search: searchTerm,
        },
      });

      console.log('API Response:', response.data); // Log the response data

      setTransactions(response.data.transactions || []); // Set transactions from response
      setTotalPages(response.data.totalPages || 0); // Set total pages
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to the first page when searching
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1); // Reset to the first page when month changes
  };

  return (
    <div className="App">
      <h1>Transactions Dashboard</h1>
      <div className="controls">
        <select value={month} onChange={handleMonthChange}>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Transactions..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Description</th>
            <th>Category</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction._id}> {/* Use _id for the key */}
                <td>{transaction.id}</td>
                <td>{transaction.title}</td>
                <td>${transaction.price.toFixed(2)}</td> {/* Format price */}
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>
                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td> {/* Format date */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default App;
