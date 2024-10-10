import React, { useEffect, useState } from 'react';

const TransactionStatistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalSales: 0,
    totalSold: 0,
    totalNotSold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching
      try {
        const response = await fetch(`http://localhost:3001/statistics?month=${selectedMonth}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStatistics({
          totalSales: data.totalSaleAmount || 0,
          totalSold: data.totalSoldItems || 0,
          totalNotSold: data.totalNotSoldItems || 0,
        });
      } catch (err) {
        setError('Error fetching statistics: ' + err.message);
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
          <p>${statistics.totalSales.toFixed(2)}</p>
        </div>
        <div className="statistic-item">
          <h3>Total Sold Items</h3>
          <p>{statistics.totalSold}</p>
        </div>
        <div className="statistic-item">
          <h3>Total Not Sold Items</h3>
          <p>{statistics.totalNotSold}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatistics;
