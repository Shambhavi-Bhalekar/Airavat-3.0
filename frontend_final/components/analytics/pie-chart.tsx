"use client"

import React from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend, Title)

type Props = {
  labels: string[]
  values: number[]
  title?: string
}

export default function PieChart({ labels, values, title }: Props) {
  const colors = ["#C9A84C", "#1B3A6B", "#10B981", "#E8A47A", "#6B5B95", "#D4A574"]
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  }

  const options = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      title: { display: !!title, text: title, font: { size: 14, weight: 'bold' }, color: '#1B3A6B' }, 
      legend: { position: 'right' as const, labels: { font: { size: 11 }, color: '#5A6A7A', padding: 12 } } 
    } 
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-[#D4D0C5] shadow-sm h-80">
      <Pie data={data} options={options as any} />
    </div>
  )
}
