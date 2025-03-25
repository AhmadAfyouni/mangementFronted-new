"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStatusPieChart = ({
  taskDone,
  taskOnGoing,
  taskOnTest,
  taskPending,
}: {
  taskPending: number;
  taskOnGoing: number;
  taskOnTest: number;
  taskDone: number;
}) => {
  // Chart.js data
  const data = {
    labels: ["Pending", "Ongoing", "On Test", "Done"],
    datasets: [
      {
        data: [taskPending, taskOnGoing, taskOnTest, taskDone],
        backgroundColor: ["#FF9800", "#2196F3", "#4CAF50", "#9C27B0"], // Custom colors
        borderColor: ["#FFB74D", "#64B5F6", "#81C784", "#BA68C8"], // Optional border colors
        borderWidth: 1,
      },
    ],
  };

  // Chart.js options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // Position of the legend
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default TaskStatusPieChart;
