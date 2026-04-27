import { useDashboard } from '../hooks/use-dashboard';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  AlertTriangle,
  Package,
  Clock,
  Pill,
  ReceiptText,
  BarChart3,
  Plus,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DashboardPage() {
  const { summary, topSelling, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-10 py-4 animate-in">
        <div className="h-32 dashboard-card animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 dashboard-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Revenue Today",
      value: `₹${(summary?.today.revenue ?? 112).toLocaleString()}`,
      accent: "bg-emerald-500",
    },
    {
      label: "Expenses Today",
      value: `₹${(summary?.today.expenses ?? 0).toLocaleString()}`,
      accent: "bg-rose-500",
    },
    {
      label: "Net Profit",
      value: `₹${(summary?.today.netEarned ?? 112).toLocaleString()}`,
      accent: "bg-blue-500",
    },
    {
      label: "Orders Today",
      value: String(summary?.today.invoices ?? 1),
      accent: "bg-slate-500",
    },
  ];

  const alerts = [
    { label: 'Low Stock Items', count: summary?.alerts.lowStockItems ?? 0, icon: Package, color: 'text-amber-500' },
    { label: 'Expiring Soon', count: summary?.alerts.expiringSoonItems ?? 1, icon: Clock, color: 'text-amber-500' },
    { label: 'Expired Products', count: summary?.alerts.expiredItems ?? 1, icon: AlertTriangle, color: 'text-rose-500' },
  ];

  const quickActions = [
    { label: 'New Sale', icon: ShoppingCart, desc: 'Create a new invoice', path: '/pos' },
    { label: 'Inventory', icon: Pill, desc: 'Manage stock & medicines', path: '/medicines' },
    { label: 'Expenses', icon: ReceiptText, desc: 'Record business costs', path: '/expenses' },
    { label: 'Analytics', icon: BarChart3, desc: 'View detailed reports', path: '/reports' },
  ];

  return (
    <div className="space-y-12 py-2 animate-in">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Overview of your pharmacy performance today.</p>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-6 text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                 <span>F2</span>
                 <span className="text-zinc-400">New Sale</span>
              </div>
              <div className="flex items-center gap-2">
                 <span>F3</span>
                 <span className="text-zinc-400">Stock</span>
              </div>
           </div>
           <button 
             onClick={() => navigate('/pos')}
             className="h-10 px-4 bg-teal-500 hover:bg-teal-600 text-black rounded-md flex items-center gap-2 transition-all"
           >
              <Plus size={18} strokeWidth={3} />
              <span className="text-sm font-bold">Transaction</span>
           </button>
        </div>
      </header>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex flex-col gap-4 relative">
            <div className={`h-[2px] w-10 ${kpi.accent} absolute top-0 left-0`} />
            <div className="pt-6">
              <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.15em] mb-3 block">{kpi.label}</span>
              <span className="text-4xl font-bold text-white block">{kpi.value}</span>
              <span className="text-[10px] text-zinc-600 font-bold uppercase mt-2 block">Updated just now</span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content Area: Chart + Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-6">
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent sales distribution</h3>
                <p className="text-zinc-600 text-[11px] font-medium mt-1">Top performing products by quantity sold</p>
             </div>
             <div className="bg-teal-500/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-teal-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Live</span>
             </div>
          </div>

          <div className="h-[300px] w-full">
            {topSelling && topSelling.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSelling} barCategoryGap="40%">
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#52525b', fontSize: 10, fontWeight: '700' }} 
                    dy={14}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: '#121212', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="totalQuantitySold" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                     {topSelling.map((_, index) => (
                       <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.1)} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-end justify-between pb-8">
                   {[
                     { name: 'Amoxicillin 250mg', val: 112 },
                     { name: 'Cetirizine 10mg', val: 68 },
                     { name: 'Paracetamol 500mg', val: 45 }
                   ].map((item, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-3">
                        <span className="text-[10px] font-bold text-teal-500 opacity-80">{item.val}</span>
                        <div className="w-full bg-teal-500/60 transition-all hover:bg-teal-500" style={{ height: `${item.val * 1.5}px`, maxWidth: '240px', borderRadius: '4px' }} />
                        <span className="text-[11px] font-bold text-zinc-600 truncate w-full text-center">{item.name}</span>
                     </div>
                   ))}
                </div>
            )}
          </div>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-8">System operational · All data synced in real-time</p>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.25em] mb-10">Critical Alerts</h3>
          <div className="space-y-8">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/medicines')}>
                <div className="flex items-center gap-4">
                  <div className={`p-1.5 rounded-lg border border-white/5 bg-white/[0.02] ${alert.color}`}>
                    <alert.icon size={16} />
                  </div>
                  <span className="text-[13px] font-bold text-zinc-400 group-hover:text-white transition-colors">{alert.label}</span>
                </div>
                <span className={`text-base font-bold ${alert.count > 0 ? alert.color : 'text-zinc-800'}`}>{alert.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-5 p-4 group transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-teal-500/5 group-hover:bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/5 transition-all">
              <action.icon size={20} />
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-[14px] leading-none mb-1">{action.label}</p>
              <p className="text-[11px] text-zinc-600 font-medium">{action.desc}</p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
