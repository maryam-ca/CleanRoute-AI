import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const WasteChart = ({ type = 'line', data, title }) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  const defaultData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Waste (kg)',
        data: [65, 59, 80, 81, 56, 95, 120],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const chartData = data || defaultData;

  const renderChart = () => {
    switch(type) {
      case 'line':
        return <Line options={chartOptions} data={chartData} />;
      case 'bar':
        return <Bar options={chartOptions} data={chartData} />;
      case 'doughnut':
        return <Doughnut options={chartOptions} data={chartData} />;
      default:
        return <Line options={chartOptions} data={chartData} />;
    }
  };

  return (
    <div className="waste-chart">
      {renderChart()}
    </div>
  );
};

export default WasteChart;