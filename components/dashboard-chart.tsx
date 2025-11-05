"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const OWNER_CODE_OPTIONS = [
  { value: "M", label: "M: Multi-location & Single-owner" },
  { value: "F", label: "F: Multi-location (franchise incl.)  & Multi-owners" },
  { value: "S", label: "S: Single-location & Individual-owner" },
  { value: "C", label: "C: Corporate & EHR/EMR/SaaS Client" },
  { value: "X", label: "X: Unique-case & Other-category" }
]

const OWNER_CODE_MAP: Record<string, string> =
  OWNER_CODE_OPTIONS.reduce((acc, o) => { acc[o.value] = o.label; return acc }, {} as Record<string, string>)

const codeToLabel = (code?: string | null) => {
  const c = (code ?? "").trim().toUpperCase()
  return OWNER_CODE_MAP[c] ?? "Unknown Owner"
}

const COLORS = ["#C9E4A4", "#FAC086", "#DAAAE4", "#A7DCF7", "#FFD38D", "#B6E3FF"]

export function DashboardChart() {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const fetchOwnerCodeData = async () => {
      try {
        const res = await fetch("/api/dashboard/owner-codes")
        const json = await res.json()
        if (!json.success) throw new Error(json.error || "Failed to load owner codes")

        const data = json.data.map((item: any) => ({
          code: (item.owner_code ?? "").toString().toUpperCase(),
          name: codeToLabel(item.owner_code),
          value: Number(item.count) || 0,
        }))

        // Sort by value desc; keep Unknown Owner last
        data.sort((a: any, b: any) => {
          const ua = a.name === "Unknown Owner"
          const ub = b.name === "Unknown Owner"
          if (ua !== ub) return ua ? 1 : -1
          return b.value - a.value
        })

        setChartData(data)
      } catch (err) {
        console.error("Owner code chart load error:", err)
      }
    }

    fetchOwnerCodeData()
  }, [])

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 1.15
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="central" fontSize={13}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

    const total = chartData.reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-center">
      {/* Pie */}
      <div className="w-full md:w-auto md:min-w-[420px] h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              nameKey="name"
              labelLine={false}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomizedLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number, _name: string, props: any) => {
                const pct = props?.payload?.percent ? (props.payload.percent * 100).toFixed(1) : "0"
                return [`${value} clients (${pct}%)`, props?.payload?.name]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend (single column, right side on md+) */}
      <div className="mt-4 md:mt-0 md:ml-8 w-full md:w-[360px]">
        <ul className="flex flex-col gap-2 text-sm">
          {chartData.map((item, idx) => {
            const pct = total ? Math.round((item.value / total) * 100) : 0
            return (
              <li key={item.name + idx} className="flex items-center gap-3">
                <span
                  className="inline-block rounded-full shrink-0"
                  style={{ width: 10, height: 10, background: COLORS[idx % COLORS.length] }}
                />
                <span className="flex-1">{item.name}</span>
                {/* <span className="tabular-nums text-muted-foreground">{pct}%</span> */}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}


// "use client"

// import { useEffect, useState } from "react"
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
// // import { supabase } from "@/lib/supabaseClient"

// // Define shorter category names for the chart
// const categoryNames = {
//   "INDEPENDENT PRACTICES: Direct House Accounts": "Independent Direct House",
//   "INDEPENDENT PRACTICES: Channel Partner Accounts": "Independent Channel Partner",
//   "CORPORATE PRACTICES: House Accounts": "Corporate House",
//   "CORPORATE ADVISORY": "Corporate Advisory",
// }

// const COLORS = ["#C9E4A4", "#FAC086", "#DAAAE4", "#A7DCF7"]

// export function DashboardChart() {
//   const [chartData, setChartData] = useState<any[]>([])

//   useEffect(() => {
//   const fetchCategoryData = async () => {
//     try {
//       const response = await fetch("/api/dashboard/categories")
//       const json = await response.json()

//       if (!json.success) throw new Error(json.error)

//       // Debug log each category name returned from API
//       json.data.forEach((item: any) => {
//         console.log("API category name:", item.category_name)
//       })

//       const chartData = json.data.map((item: any) => {
//         const normalizedCategory = item.category_name?.trim().toLowerCase()
//         const displayName =
//           Object.entries(categoryNames).find(
//             ([key]) => key.toLowerCase().trim() === normalizedCategory
//           )?.[1] || "Unknown Category"

//         return {
//           name: displayName,
//           value: item.count,
//         }
//       })

//       console.log("Final chart data for Pie:", chartData)
//       setChartData(chartData)
//     } catch (error) {
//       console.error("Failed to fetch chart data:", error)
//     }
//   }

//   fetchCategoryData()
// }, [])


//   // useEffect(() => {
//   //   const fetchCategoryData = async () => {
//   //     const { data, error } = await supabase
//   //       .from("Clients")
//   //       .select("category_id, category:category_id(category_name)")

//   //     if (error) {
//   //       console.error("Error fetching category data:", error)
//   //       return
//   //     }

//   //     const categoryCounts = data?.reduce((acc: any, client: any) => {
//   //       const categoryName = client.category?.category_name || "Other"
//   //       if (acc[categoryName]) {
//   //         acc[categoryName] += 1
//   //       } else {
//   //         acc[categoryName] = 1
//   //       }
//   //       return acc
//   //     }, {})

//   //     const chartData = Object.keys(categoryCounts).map((category) => ({
//   //       name: categoryNames[category as keyof typeof categoryNames] || category,
//   //       value: categoryCounts[category],
//   //     }))

//   //     setChartData(chartData)
//   //   }

//   //   fetchCategoryData()
//   // }, [])

//   // ✅ Custom label with font size and positioning
//   const renderCustomizedLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     percent,
//   }: any) => {
//     const RADIAN = Math.PI / 180
//     const radius = innerRadius + (outerRadius - innerRadius) * 1.15
//     const x = cx + radius * Math.cos(-midAngle * RADIAN)
//     const y = cy + radius * Math.sin(-midAngle * RADIAN)

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="#000"
//         textAnchor="middle"
//         dominantBaseline="central"
//         fontSize={13} // You can adjust this
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     )
//   }

//   return (
//     <div className="h-[300px] w-full flex justify-center">
//       <div className="w-full max-w-[500px] h-[280px] flex justify-center items-center">
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={chartData}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             outerRadius={85} // ✅ reduced from 100 to 80
//             fill="#8884d8"
//             dataKey="value"
//             label={renderCustomizedLabel}
//           >
//             {chartData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend
//             layout="vertical"
//             align="right"
//             verticalAlign="middle"
//             wrapperStyle={{ fontSize: '13px', lineHeight: '22px' }}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//     </div>
//   )  
// }
