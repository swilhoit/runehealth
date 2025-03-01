'use client';

import { useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register the components we need
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface HealthScore {
  cardio: number;
  metabolic: number;
  liver: number;
  immunity: number;
}

interface HealthRadarChartProps {
  scores: HealthScore;
  className?: string;
}

const HealthRadarChart: React.FC<HealthRadarChartProps> = ({ scores, className = '' }) => {
  // Normalize scores to 0-10 range if they're not already
  const normalizeScore = (score: number): number => {
    return Math.max(0, Math.min(10, score));
  };

  const data: ChartData<'radar'> = {
    labels: ['Cardiovascular', 'Metabolic', 'Liver', 'Immunity'],
    datasets: [
      {
        label: 'Health Score',
        data: [
          normalizeScore(scores.cardio),
          normalizeScore(scores.metabolic),
          normalizeScore(scores.liver),
          normalizeScore(scores.immunity)
        ],
        backgroundColor: 'rgba(236, 108, 98, 0.2)',
        borderColor: 'rgba(236, 108, 98, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(236, 108, 98, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(236, 108, 98, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options: ChartOptions<'radar'> = {
    scales: {
      r: {
        min: 0,
        max: 10,
        beginAtZero: true,
        ticks: {
          stepSize: 2,
          display: false,
        },
        pointLabels: {
          font: {
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            size: 12,
            weight: 500
          },
          color: '#475569', // Slate-600
        },
        grid: {
          color: 'rgba(203, 213, 225, 0.4)', // Slate-200 with opacity
        },
        angleLines: {
          color: 'rgba(203, 213, 225, 0.4)', // Slate-200 with opacity
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155', // Slate-700
        bodyColor: '#334155', // Slate-700
        borderColor: 'rgba(203, 213, 225, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        boxPadding: 5,
        displayColors: false,
        callbacks: {
          title: (items) => `${items[0].label}`,
          label: (context) => {
            const score = context.raw as number;
            let label = `Score: ${score.toFixed(1)}`;
            
            // Add interpretation
            if (score >= 8) {
              label += ' (Excellent)';
            } else if (score >= 6) {
              label += ' (Good)';
            } else if (score >= 4) {
              label += ' (Fair)';
            } else {
              label += ' (Needs Attention)';
            }
            
            return label;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1 // Slightly smoother lines
      }
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Radar 
        data={data} 
        options={options}
      />
    </div>
  );
};

export default HealthRadarChart; 