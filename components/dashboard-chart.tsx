"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#C9E4A4", "#FAC086", "#DAAAE4", "#A7DCF7", "#FFD38D", "#B6E3FF"]

export function DashboardChart() {
  const [stateData, setStateData] = useState<any[]>([])
  const [industryData, setIndustryData] = useState<any[]>([])

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const [stateRes, industryRes] = await Promise.all([
          fetch("/api/dashboard/top-states"),
          fetch("/api/dashboard/top-industries"),
        ])

        const stateJson = await stateRes.json()
        const industryJson = await industryRes.json()

        if (stateJson.success) setStateData(stateJson.data)
        if (industryJson.success) setIndustryData(industryJson.data)
      } catch (err) {
        console.error("Chart fetch failed:", err)
      }
    }

    fetchCharts()
  }, [])

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 1.15
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const renderPie = (title: string, data: any[]) => (
    <div className="flex flex-col items-center w-full md:w-1/2 p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              nameKey="name"
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={renderLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-400 italic">
          No data available yet
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full flex flex-col md:flex-row justify-center">
      {renderPie("Top States by Company Count", stateData)}
      {renderPie("Top Industries by Company Count", industryData)}
    </div>
  )
}
