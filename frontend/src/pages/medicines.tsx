import { useState } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useAuth } from '../contexts/auth-context';
import { useToast } from '../contexts/toast-context';
import { MedicineForm } from '../components/medicines/medicine-form';
import { StockBadge } from '../components/ui/badge';
import { ConfirmationModal } from '../components/ui/confirmation-modal';
import { TableSkeleton } from '../components/ui/loading-skeleton';
import type { Medicine } from '../lib/types';
import { Search, Plus, Edit3, Trash2, AlertTriangle, Package, Package2 } from 'lucide-react';

type MedicineTab = 'all' | 'low' | 'expiring' | 'expired';

export function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<MedicineTab>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const { medicines, isLoading, createMedicine, updateMedicine, deleteMedicine } = useMedicines(
    activeTab === 'all' ? searchTerm : undefined
  );

  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const getFilteredMedicines = () => {
    const list = medicines || [];
    switch (activeTab) {
      case 'low':
        return list.filter(m => m.stock <= m.reorderLevel);
      case 'expiring':
        return list.filter(m => {
          const exp = new Date(m.expiryDate);
          return exp > now && exp <= thirtyDays;
        });
      case 'expired':
        return list.filter(m => new Date(m.expiryDate) <= now);
      default:
        return list;
    }
  };

  const filteredMeds = getFilteredMedicines();

  const getStockStatus = (med: Medicine) => {
    if (new Date(med.expiryDate) <= now) return { expired: true };
    if (new Date(med.expiryDate) <= thirtyDays) return { expiring: true };
    if (med.stock <= med.reorderLevel) return { lowStock: true };
    if (med.stock === 0) return { outOfStock: true };
    return { inStock: true };
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicine(id);
      success('Medicine deleted');
      setDeleteId(null);
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : 'Deletion failed');
    }
  };

  const tabs: { id: MedicineTab; label: string; icon?: typeof Package }[] = [
    { id: 'all', label: 'All Inventory' },
    { id: 'low', label: 'Low Stock', icon: Package },
    { id: 'expiring', label: 'Expiring Soon', icon: AlertTriangle },
    { id: 'expired', label: 'Expired', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 animate-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Inventory</h1>
          <p className="text-zinc-500 text-sm font-medium mt-1">Manage your pharmacy stock and medicine records.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingMedicine(null);
              setIsFormOpen(true);
            }}
            className="btn btn-primary h-12 px-6"
          >
            <Plus size={18} /> <span className="font-bold">Add Medicine</span>
          </button>
        )}
      </header>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Stock', val: medicines?.reduce((acc, m) => acc + m.stock, 0) || 0, color: 'text-white' },
          { label: 'Low Stock', val: medicines?.filter(m => m.stock <= m.reorderLevel).length || 0, color: 'text-amber-500' },
          { label: 'Expired Items', val: medicines?.filter(m => new Date(m.expiryDate) <= now).length || 0, color: 'text-rose-500' },
          { label: 'Unique Products', val: medicines?.length || 0, color: 'text-teal-500' },
        ].map((stat, i) => (
          <div key={i} className="dashboard-card p-5">
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
             <h4 className={`text-2xl font-bold ${stat.color}`}>{stat.val}</h4>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Filters and Search Combined */}
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-full lg:flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-teal-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, manufacturer or chemical..."
              className="input h-13 pl-12 bg-zinc-900/50 border-white/5"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 p-1.5 bg-zinc-900/50 rounded-xl border border-white/5 overflow-x-auto w-full lg:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MedicineTab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-zinc-800 text-teal-400 border border-teal-500/20' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="dashboard-card overflow-hidden bg-[#0c0c0e]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-[#121214]">
                  <th className="p-5 text-left">Medicine Entry</th>
                  <th className="p-5 text-center">Stock Level</th>
                  <th className="p-5 text-right">Price</th>
                  <th className="p-5 text-center">Expiry</th>
                  <th className="p-5 text-center">Status</th>
                  {isAdmin && <th className="p-5 text-center w-32">Manage</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading && <TableSkeleton rows={8} columns={isAdmin ? 6 : 5} />}
                {!isLoading && filteredMeds.length > 0 &&
                  filteredMeds.map(med => {
                    const status = getStockStatus(med);
                    return (
                      <tr key={med._id} className="group border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors">
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-teal-400 transition-colors">{med.name}</span>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase mt-1">{med.manufacturer}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col items-center">
                            <span className={`text-sm font-bold ${med.stock <= med.reorderLevel ? 'text-amber-500' : 'text-zinc-300'}`}>
                              {med.stock}
                            </span>
                            <div className="w-16 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${med.stock <= med.reorderLevel ? 'bg-amber-500' : 'bg-teal-500'}`}
                                style={{ width: `${Math.min(100, (med.stock / (med.reorderLevel * 2)) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">₹{med.sellingPrice}</span>
                            <span className="text-[10px] text-zinc-600 font-bold uppercase mt-1">MRP ₹{med.mrp}</span>
                          </div>
                        </td>
                        <td className="p-5 text-center">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-zinc-400 uppercase">
                                 {new Date(med.expiryDate).toLocaleDateString('en-GB', {
                                   month: 'short',
                                   year: 'numeric',
                                 })}
                              </span>
                              <span className="text-[9px] text-zinc-600 font-black uppercase mt-1">EXPIRY</span>
                           </div>
                        </td>
                        <td className="p-5 text-center">
                          <StockBadge {...status} />
                        </td>
                        {isAdmin && (
                          <td className="p-5">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingMedicine(med);
                                  setIsFormOpen(true);
                                }}
                                className="h-9 w-9 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-teal-400 hover:border-teal-400/30 flex items-center justify-center transition-all group/btn"
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteId(med._id)}
                                className="h-9 w-9 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-rose-500 hover:border-rose-400/30 flex items-center justify-center transition-all group/btn"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                {!isLoading && filteredMeds.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-zinc-600">
                        <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center">
                          <Package2 size={32} strokeWidth={1} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Invetory Empty</p>
                           <p className="text-xs mt-1">No medicines match current filter criteria.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <MedicineForm
            medicine={editingMedicine}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMedicine(null);
            }}
            onSubmit={async data => {
              try {
                if (editingMedicine) {
                  await updateMedicine({ id: editingMedicine._id, dto: data });
                  success('Medicine updated');
                } else {
                  await createMedicine(data);
                  success('Medicine added');
                }
                setIsFormOpen(false);
                setEditingMedicine(null);
              } catch (err: unknown) {
                error(err instanceof Error ? err.message : 'Operation failed');
              }
            }}
          />
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        title="Delete Medicine Entry"
        message="This will permanently remove the medicine from your inventory database."
        isDangerous
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Confirm Delete"
      />
    </div>
  );
}
