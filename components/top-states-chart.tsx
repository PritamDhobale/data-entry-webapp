"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#C9E4A4", "#FAC086", "#DAAAE4", "#A7DCF7", "#FFD38D", "#B6E3FF"];

export function TopStatesChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/top-states", { cache: "no-store" });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to load states chart");

        const chartData = json.data.map((item: any) => ({
        name: item.name || "Unknown",
        value: item.value || 0,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Top States chart error:", err);
      }
    };
    fetchData();
  }, []);

  const renderLabel = ({ percent }: any) => `${(percent * 100).toFixed(0)}%`;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            label={renderLabel}
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `${v} companies`} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legends */}
      <ul className="grid grid-cols-2 gap-2 text-sm mt-4 w-full">
        {data.map((item, i) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <li key={i} className="flex items-center gap-2">
              <span
                className="inline-block rounded-full"
                style={{ width: 10, height: 10, background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1">{item.name}</span>
              <span className="text-gray-500">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
