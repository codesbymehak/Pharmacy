import { useState } from 'react';
import { useReports } from '../hooks/use-reports';
import { KPICard } from '../components/ui/kpi-card';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Download } from 'lucide-react';

export function ReportsPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { summary, isLoading } = useReports({ period });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 animate-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 dashboard-card animate-pulse" />
          ))}
        </div>
        <div className="h-[450px] dashboard-card animate-pulse" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `₹${(summary?.grandTotals.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: 'Total Expenses',
      value: `₹${(summary?.grandTotals.totalExpenses ?? 0).toLocaleString()}`,
      icon: TrendingDown,
    },
    {
      label: 'Net Earned',
      value: `₹${(summary?.grandTotals.netEarned ?? 0).toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      label: 'Invoices',
      value: String(summary?.grandTotals.totalInvoices ?? 0),
      icon: Receipt,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8 px-4 animate-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Financials</h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">Deep dive into your pharmacy business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/5 flex items-center gap-1">
            {(['weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                  period === p 
                    ? 'bg-zinc-800 text-teal-400 border border-teal-500/20' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => window.print()} className="h-11 w-11 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:bg-zinc-800">
            <Download size={18} />
          </button>
        </div>
      </header>

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <KPICard 
            key={i} 
            icon={kpi.icon} 
            label={kpi.label} 
            value={kpi.value} 
          />
        ))}
      </section>

      {/* Analytics Chart */}
      <div className="dashboard-card p-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-lg font-bold text-white">Cash Flow Analysis</h3>
            <p className="text-zinc-500 text-xs mt-1">Comparison between total revenue and operating expenses.</p>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Revenue</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Expenses</span>
             </div>
          </div>
        </div>

        <div className="h-[480px] w-full">
          {summary?.timeSeries && summary.timeSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.timeSeries} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#52525b', fontSize: 11, fontWeight: '600' }}
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                />
                <YAxis
                  tick={{ fill: '#52525b', fontSize: 11, fontWeight: '600' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={val => `₹${val}`}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                  contentStyle={{
                    background: '#09090b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', marginBottom: '6px' }}
                  formatter={(value: unknown) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
              <TrendingUp size={48} strokeWidth={1} className="opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No statistical data for this period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
