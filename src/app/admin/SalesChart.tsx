"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DayData {
  day: string;
  revenue: number;
  orders: number;
}

export default function SalesChart({ data }: { data: DayData[] }) {
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const hasData = totalRevenue > 0 || totalOrders > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-black text-slate-900">Revenue Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">7 วันล่าสุด</p>
        </div>
        <div className="text-right">
          <p className="font-black text-slate-900 text-lg">฿{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400">{totalOrders} orders</p>
        </div>
      </div>

      {!hasData ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-300">
          <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-bold text-sm">ยังไม่มีข้อมูล</p>
          <p className="text-xs mt-1">จะแสดงเมื่อมี order เข้ามา</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `฿${(v/1000).toFixed(0)}k` : `฿${v}`} width={48} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(val: number, name: string) => [
                name === "revenue" ? `฿${val.toLocaleString()}` : `${val} orders`,
                name === "revenue" ? "รายได้" : "คำสั่งซื้อ",
              ]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" dot={{ fill: "#0d9488", r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
