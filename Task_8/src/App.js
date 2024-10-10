// App.js

import React, { useState } from 'react';
import TransactionStatistics from './TransactionStatistics';
import './App.css'
const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div className="App">
      <h1>Transaction Dashboard</h1>
      <div className="controls">
        <select value={selectedMonth} onChange={handleMonthChange}>
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      
      <TransactionStatistics selectedMonth={selectedMonth} />
      
      {/* Include your table component here */}
    </div>
  );
};

export default App;
