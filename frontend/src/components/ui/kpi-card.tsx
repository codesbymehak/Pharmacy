import { type LucideIcon } from 'lucide-react';

type KPIVariant = 'default' | 'red' | 'amber' | 'green' | 'blue';

interface KPICardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: KPIVariant;
  className?: string;
}

export function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  className = '',
}: KPICardProps) {
  return (
    <div className={`dashboard-card p-6 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className="text-zinc-400" />}
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtext && <p className="text-[10px] text-zinc-600 font-medium mt-1 uppercase">{subtext}</p>}
      </div>
    </div>
  );
}
