"use client"

import React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

type Props = {
  labels: string[]
  values: number[]
  title?: string
}

export default function LineChart({ labels, values, title }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: title || "",
        data: values,
        borderColor: "rgba(27, 58, 107, 0.9)",
        backgroundColor: "rgba(201, 168, 76, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "rgba(201, 168, 76, 1)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
      },
    ],
  }

  const options = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false }, 
      title: { display: !!title, text: title, font: { size: 14, weight: 'bold' }, color: '#1B3A6B' } 
    },
    scales: { 
      y: { ticks: { color: '#5A6A7A', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { color: '#5A6A7A', font: { size: 11 } }, grid: { display: false } }
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-[#D4D0C5] shadow-sm h-56">
      <Line data={data} options={options as any} />
    </div>
  )
}
