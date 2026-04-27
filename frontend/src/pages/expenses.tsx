import { useState } from 'react';
import { useExpenses } from '../hooks/use-expenses';
import { ModalForm } from '../components/ui/modal-form';
import { Badge } from '../components/ui/badge';
import { Plus, ReceiptText, Filter } from 'lucide-react';
import type { CreateExpenseDto } from '../lib/types';
import { useToast } from '../contexts/toast-context';
import { TableSkeleton } from '../components/ui/loading-skeleton';

export function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<{ period?: string; startDate?: string; endDate?: string }>({
    period: 'monthly',
  });
  const [formData, setFormData] = useState<CreateExpenseDto>({
    amount: 0,
    category: 'Salary',
    description: '',
  });

  const { success, error } = useToast();
  const { expenses, isLoading, createExpense } = useExpenses(filters);
  const totalAmount = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      error('Please fill all fields');
      return;
    }
    try {
      await createExpense(formData);
      setIsModalOpen(false);
      setFormData({ amount: 0, category: 'Salary', description: '' });
      success('Expense added successfully');
    } catch (err: any) {
      error(err.message || 'Failed to add expense');
    }
  };

  const categories = ['Salary', 'Rent', 'Utilities', 'Supplies', 'Marketing', 'Maintenance', 'Other'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Salary':
        return 'blue';
      case 'Inventory Purchase':
        return 'amber';
      default:
        return 'green';
    }
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight text-gradient">Operating Expenses</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Financial Outflow Monitoring</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn btn-primary h-12 px-8 shadow-xl shadow-rose-500/10 border-rose-500/20 bg-gradient-to-r from-rose-600 to-rose-500"
        >
          <Plus size={18} /> <span className="font-bold">Log New Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Stat Card */}
        <div className="glass-panel p-8 bg-rose-500/5 border-rose-500/10 flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Total Period Expense</p>
              <h2 className="text-4xl font-black text-white">₹{totalAmount.toLocaleString()}</h2>
           </div>
           <div className="flex items-center gap-2 mt-6">
              <div className="px-2 py-1 rounded bg-rose-500 text-white text-[9px] font-black uppercase">Attention</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Based on current filters</p>
           </div>
        </div>

        {/* Filter Panel */}
        <div className="md:col-span-2 glass-panel p-8 bg-white/[0.02] border-white/5">
          <div className="flex items-center gap-3 mb-6">
             <Filter size={14} className="text-teal-500" />
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Interval Configuration</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Preset Period</label>
               <select
                  className="select h-12 bg-black/40 border-white/5 text-sm font-bold"
                  value={filters.period || ''}
                  onChange={e => setFilters({ period: e.target.value, startDate: '', endDate: '' })}
                >
                  <option value="weekly">Current Week</option>
                  <option value="monthly">Current Month</option>
                  <option value="yearly">Current Year</option>
                  <option value="">Custom Range</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">From Date</label>
               <input
                  type="date"
                  className="input h-12 bg-black/20 border-white/5 text-sm font-bold"
                  value={filters.startDate || ''}
                  onChange={e => setFilters({ period: '', startDate: e.target.value, endDate: filters.endDate })}
                />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">To Date</label>
               <input
                  type="date"
                  className="input h-12 bg-black/20 border-white/5 text-sm font-bold"
                  value={filters.endDate || ''}
                  onChange={e => setFilters({ period: '', startDate: filters.startDate, endDate: e.target.value })}
                />
            </div>
          </div>
        </div>
      </div>

      <div className="premium-table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Expense Date</th>
              <th className="w-48 text-center">Classification</th>
              <th>Description & Reference</th>
              <th className="w-32 text-right">Debit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeleton rows={8} columns={4} />}
            {!isLoading && expenses && expenses.length > 0 && (
              expenses.map(expense => (
                <tr key={expense._id} className="group">
                  <td className="text-sm font-bold text-slate-400">
                    <div className="flex flex-col">
                      <span>{new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Recorded</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <Badge label={expense.category} variant={getCategoryColor(expense.category) as any} />
                  </td>
                  <td>
                    <div className="flex flex-col">
                       <span className="text-white font-medium group-hover:text-rose-400 transition-colors uppercase tracking-tight text-sm">{expense.description}</span>
                       <span className="text-[9px] text-slate-600 font-bold uppercase mt-0.5 tracking-tighter">REF_{expense._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="text-right">
                     <span className="text-lg font-black text-white">₹{expense.amount.toLocaleString()}</span>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && (!expenses || expenses.length === 0) && (
              <tr>
                <td colSpan={4} className="py-24">
                  <div className="flex flex-col items-center justify-center text-slate-600">
                    <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                      <ReceiptText size={32} className="opacity-10" />
                    </div>
                    <h4 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">No Ledger Entries</h4>
                    <p className="text-xs font-medium mt-2">Adjust your period selection or record a new expense</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalForm
        title="Log New Expense"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        submitLabel="Save Expense"
        maxWidth="max-w-md"
      >
        <div className="form-field">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className="input"
            value={formData.amount || ''}
            onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label">Category</label>
          <select
            className="select"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Description</label>
          <textarea
            required
            className="input"
            placeholder="What was this expense for?"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            style={{ minHeight: '100px', resize: 'vertical' }}
          />
        </div>
      </ModalForm>
    </div>
  );
}
