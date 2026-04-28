import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * BiasChart - Chart.js bar chart for group approval rates
 */
function BiasChart({ data, title = 'Approval Rate by Group' }) {
  const labels = Object.keys(data);
  const values = Object.values(data).map((v) => Math.round(v * 100));

  const getColor = (rate) => {
    if (rate >= 80) return 'rgba(34, 197, 94, 0.8)';
    if (rate >= 50) return 'rgba(245, 158, 11, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };

  const getBorderColor = (rate) => {
    if (rate >= 80) return 'rgb(34, 197, 94)';
    if (rate >= 50) return 'rgb(245, 158, 11)';
    return 'rgb(239, 68, 68)';
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Approval Rate (%)',
        data: values,
        backgroundColor: values.map(getColor),
        borderColor: values.map(getBorderColor),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 16, weight: '600', family: 'Inter' },
        color: '#1e293b',
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `Approval Rate: ${ctx.raw}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: {
          callback: (v) => v + '%',
          font: { size: 12, family: 'Inter' },
          color: '#64748b',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 13, weight: '500', family: 'Inter' },
          color: '#475569',
        },
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default BiasChart;
