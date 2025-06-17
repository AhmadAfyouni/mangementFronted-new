"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { TrendingUp, CheckCircle, Clock, AlertCircle, XCircle, Ban } from "lucide-react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStatusPieChart = ({
  taskDone,
  taskOnGoing,
  taskOnTest,
  taskPending,
  taskClosed = 0,
  taskCanceled = 0,
}: {
  taskPending: number;
  taskOnGoing: number;
  taskOnTest: number;
  taskDone: number;
  taskClosed?: number;
  taskCanceled?: number;
}) => {
  // Calculate totals
  const totalTasks = taskPending + taskOnGoing + taskOnTest + taskDone + taskClosed + taskCanceled;
  const completionRate = totalTasks > 0 ? Math.round((taskDone / totalTasks) * 100) : 0;

  // Status data with icons and enhanced styling
  const statusData = [
    {
      label: "Pending",
      value: taskPending,
      color: "#FF9800",
      lightColor: "#FFE0B2",
      icon: Clock,
      description: "Awaiting start"
    },
    {
      label: "Ongoing",
      value: taskOnGoing,
      color: "#2196F3",
      lightColor: "#E3F2FD",
      icon: TrendingUp,
      description: "In progress"
    },
    {
      label: "On Test",
      value: taskOnTest,
      color: "#9C27B0",
      lightColor: "#F3E5F5",
      icon: AlertCircle,
      description: "Under review"
    },
    {
      label: "Done",
      value: taskDone,
      color: "#4CAF50",
      lightColor: "#E8F5E8",
      icon: CheckCircle,
      description: "Completed"
    },
    {
      label: "Closed",
      value: taskClosed,
      color: "#F44336",
      lightColor: "#FFEBEE",
      icon: XCircle,
      description: "Finalized"
    },
    {
      label: "Canceled",
      value: taskCanceled,
      color: "#673AB7",
      lightColor: "#EDE7F6",
      icon: Ban,
      description: "Terminated"
    }
  ]; // Show all statuses even with 0 tasks

  // Chart.js data - only include statuses that have tasks for the chart
  const chartData = statusData.filter(item => item.value > 0);

  const data = {
    labels: chartData.map(item => item.label),
    datasets: [
      {
        data: chartData.map(item => item.value),
        backgroundColor: chartData.map(item => item.color),
        borderColor: chartData.map(item => item.lightColor),
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
        hoverBackgroundColor: chartData.map(item => item.color),
      },
    ],
  };

  // Enhanced Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create a custom legend
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = totalTasks > 0 ? Math.round((value / totalTasks) * 100) : 0;
            return `${label}: ${value} tasks (${percentage}%)`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderJoinStyle: 'round' as const,
      }
    },
    cutout: '65%', // Creates a donut chart effect
  };

  return (
    <div className="relative bg-dark rounded-2xl p-6 border border-gray-700/50 shadow-2xl h-full">
      {/* Header with completion rate */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-twhite mb-1">Task Distribution</h3>
          <p className="text-tdark text-sm">Project progress overview</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-success">{completionRate}%</div>
          <div className="text-xs text-tdark uppercase tracking-wide">Complete</div>
        </div>
      </div>

      <div className="grid grid-cols-1  gap-16  ">
        {/* Chart Container */}
        <div className="relative ">
          <div className="h-48 relative">
            <Pie data={data} options={options} />
            {/* Center text overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-twhite">{totalTasks}</div>
                <div className="text-xs text-tdark uppercase tracking-wide">Total Tasks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Legend */}
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-5 ">
          {statusData.map((item, index) => {
            const Icon = item.icon;
            const percentage = totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0;

            return (
              <div
                key={index}
                className=" flex items-center justify-between p-3 rounded-xl bg-secondary border border-gray-700/30 hover:bg-dark/50 transition-all duration-200 group md:col-span-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg shadow-lg"
                    style={{ backgroundColor: `${item.color}20`, borderColor: item.color }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: item.color }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-twhite text-sm">{item.label}</div>
                    <div className="text-xs text-tdark">{item.description}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-twhite">{item.value}</div>
                  <div className="text-xs text-tdark">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TaskStatusPieChart;