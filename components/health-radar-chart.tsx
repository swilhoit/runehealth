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
  thyroid?: number;
  vitamin?: number;
  kidney?: number;
  hormone?: number;
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

  // Get all available scores (filter out undefined)
  const getLabels = () => {
    const labelMap: Record<string, string> = {
      cardio: 'Cardiovascular',
      metabolic: 'Metabolic',
      liver: 'Liver',
      immunity: 'Immunity',
      thyroid: 'Thyroid',
      vitamin: 'Vitamins',
      kidney: 'Kidney',
      hormone: 'Hormones'
    };
    
    return Object.keys(scores)
      .filter(key => scores[key as keyof HealthScore] !== undefined)
      .map(key => labelMap[key] || key);
  };
  
  const getData = () => {
    return Object.keys(scores)
      .filter(key => scores[key as keyof HealthScore] !== undefined)
      .map(key => normalizeScore(scores[key as keyof HealthScore] || 0));
  };

  const data: ChartData<'radar'> = {
    labels: getLabels(),
    datasets: [
      {
        label: 'Health Score',
        data: getData(),
        backgroundColor: 'rgba(134, 92, 105, 0.2)', // #865C69 with opacity
        borderColor: '#865C69', // #865C69
        borderWidth: 2,
        pointBackgroundColor: '#725556', // #725556
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#725556', // #725556
        pointRadius: 0,
        pointHoverRadius: 0,
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
            size: getLabels().length > 5 ? 8 : 10, // Smaller font for more categories
            weight: 500
          },
          color: '#7A8084', // Primary 400
          padding: getLabels().length > 5 ? 6 : 10, // Less padding for more categories
        },
        grid: {
          color: 'rgba(228, 217, 203, 0.4)', // #E4D9CB (Primary 200) with opacity
        },
        angleLines: {
          color: 'rgba(228, 217, 203, 0.4)', // #E4D9CB (Primary 200) with opacity
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#555353', // Primary 600
        bodyColor: '#555353', // Primary 600
        borderColor: 'rgba(228, 217, 203, 0.8)', // #E4D9CB (Primary 200) with opacity
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
    layout: {
      padding: {
        top: 5,
        right: getLabels().length > 5 ? 15 : 10,
        bottom: 5,
        left: getLabels().length > 5 ? 15 : 10
      }
    }
  };

  return (
    <div className={`w-full h-full mx-auto p-2 ${className}`}>
      <Radar 
        data={data} 
        options={{
          ...options,
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: {
              top: 5,
              right: getLabels().length > 5 ? 15 : 10,
              bottom: 5,
              left: getLabels().length > 5 ? 15 : 10
            }
          }
        }}
      />
    </div>
  );
};

export default HealthRadarChart; 