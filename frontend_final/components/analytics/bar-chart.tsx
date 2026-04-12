"use client"

import React from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type Props = {
  labels: string[]
  values: number[]
  title?: string
}

export default function BarChart({ labels, values, title }: Props) {
  const data = {
    labels,
    datasets: [
      {
        label: title || "",
        data: values,
        backgroundColor: "rgba(201, 168, 76, 0.85)",
        borderColor: "rgba(201, 168, 76, 1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, font: { size: 14, weight: 'bold' }, color: '#1B3A6B' },
    },
    scales: { 
      y: { beginAtZero: true, ticks: { color: '#5A6A7A', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { ticks: { color: '#5A6A7A', font: { size: 11 } }, grid: { display: false } }
    },
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-[#D4D0C5] shadow-sm h-56">
      <Bar data={data} options={options as any} />
    </div>
  )
}
