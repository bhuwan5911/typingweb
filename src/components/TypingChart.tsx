import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TypingChartProps {
  wpmHistory: Array<{ time: number; wpm: number }>;
  darkMode: boolean;
}

const TypingChart: React.FC<TypingChartProps> = ({ wpmHistory, darkMode }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '📈 WPM Progress',
        color: darkMode ? '#ffffff' : '#ffffff',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? '#ffffff' : '#000000',
        bodyColor: darkMode ? '#ffffff' : '#000000',
        borderColor: darkMode ? '#ffffff' : '#000000',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (seconds)',
          color: darkMode ? '#ffffff' : '#ffffff',
        },
        ticks: {
          color: darkMode ? '#cccccc' : '#ffffff',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Words Per Minute',
          color: darkMode ? '#ffffff' : '#ffffff',
        },
        ticks: {
          color: darkMode ? '#cccccc' : '#ffffff',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const data = {
    labels: wpmHistory.map(point => `${point.time}s`),
    datasets: [
      {
        label: 'WPM',
        data: wpmHistory.map(point => point.wpm),
        borderColor: darkMode ? '#8b5cf6' : '#3b82f6',
        backgroundColor: darkMode 
          ? 'rgba(139, 92, 246, 0.1)' 
          : 'rgba(59, 130, 246, 0.1)',
        fill: true,
        pointBackgroundColor: darkMode ? '#8b5cf6' : '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: darkMode ? '#8b5cf6' : '#3b82f6',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border transition-all duration-300 ${
      darkMode 
        ? 'bg-white/10 border-white/20' 
        : 'bg-white/20 border-white/30'
    }`}>
      <div style={{ height: '300px' }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default TypingChart;