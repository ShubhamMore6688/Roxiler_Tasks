// TransactionStatistics.js
import './Statistics.css'
import React, { useEffect, useState } from 'react';

const TransactionStatistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/statistics?month=${selectedMonth}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data); // Log the API response

        // Update state with correct keys from the API response
        setStatistics({
          totalSaleAmount: data.totalSaleAmount || 0,
          totalSoldItems: data.totalSoldItems || 0,
          totalNotSoldItems: data.totalNotSoldItems || 0
        });
      } catch (err) {
        setError('Error fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedMonth]);

  if (loading) return <p>Loading statistics...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="statistics-container">
      <h2>Transaction Statistics for {selectedMonth}</h2>
      <div className="statistics-box">
        <div className="statistic-item">
          <h3>Total Sales Amount</h3>
          <p>${statistics.totalSaleAmount.toFixed(2)}</p>
        </div>
        <div className="statistic-item">
          <h3>Total Sold Items</h3>
          <p>{statistics.totalSoldItems}</p>
        </div>
        <div className="statistic-item">
          <h3>Total Not Sold Items</h3>
          <p>{statistics.totalNotSoldItems}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatistics;
