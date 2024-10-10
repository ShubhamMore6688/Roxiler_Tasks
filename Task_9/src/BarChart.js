import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './App.css';

// Register all Chart.js components
Chart.register(...registerables);

const BarChart = ({ selectedMonth }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarChartData = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching
      try {
        const response = await fetch(`http://localhost:3000/barchart?month=${selectedMonth}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result.priceRanges || []); // Adjust this according to your API response structure
      } catch (err) {
        setError('Error fetching chart data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBarChartData();
  }, [selectedMonth]);

  if (loading) return <p>Loading bar chart...</p>;
  if (error) return <p>{error}</p>;

  // Prepare data for the chart
  const chartData = {
    labels: data.map(range => range.range),
    datasets: [
      {
        label: 'Number of Items',
        data: data.map(range => range.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bar-chart-container">
      <h2>Transactions Bar Chart for {selectedMonth}</h2>
      <Bar data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default BarChart;
