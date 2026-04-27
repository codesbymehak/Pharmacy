import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useMedicines } from '../hooks/use-medicines';
import { useCart } from '../hooks/use-cart';
import { api } from '../lib/api';
import { useToast } from '../contexts/toast-context';
import type { Sale, CreateSaleDto, Medicine } from '../lib/types';
import {
  Search,
  Trash2,
  User,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Printer,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';

export function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { success, error } = useToast();
  const { medicines } = useMedicines(searchTerm);
  const { cartItems, addItem, removeItem, updateQuantity, clearCart, total } = useCart();

  const filteredMedicines = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return (medicines || []).filter(m => m.stock > 0).slice(0, 8);
  }, [medicines, searchTerm]);

  const showDropdown = useMemo(
    () => filteredMedicines.length > 0 && searchTerm.length > 0,
    [filteredMedicines, searchTerm],
  );

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    const dto: CreateSaleDto = {
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      paymentMethod,
      items: cartItems.map(item => ({
        medicineId: item._id,
        quantity: item.quantity,
      })),
    };

    try {
      const sale = await api.post<Sale>('/sales', dto);
      setLastSale(sale);
      success('Invoice generated successfully!');
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [cartItems, customerName, customerPhone, paymentMethod, success, error, clearCart]);

  const handleSelectMedicine = (med: Medicine) => {
    addItem(med);
    setSearchTerm('');
    searchRef.current?.focus();
  };

  const handleClearSession = () => {
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setShowClearConfirm(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' || e.key === 'F10') {
        e.preventDefault();
        handleCheckout();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCheckout]);

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-140px)] animate-in flex flex-col gap-6 p-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Checkout Terminal</h1>
          <p className="text-zinc-500 text-sm mt-1">Select products and complete the sale transaction.</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-xl">
           <div className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
           <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Active Session</span>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left side: Search and Cart */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          <div className="relative">
            <div className="dashboard-card bg-[#121214] border-white/10 focus-within:border-teal-500/50 transition-colors">
              <div className="flex items-center px-5 py-4 gap-4">
                <Search size={20} className="text-zinc-500" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search medicine by name or barcode..."
                  className="bg-transparent border-none outline-none text-white w-full text-lg placeholder:text-zinc-600"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <div className="hidden sm:flex gap-1.5 items-center px-2 py-1 bg-zinc-800 rounded border border-white/5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Esc</span>
                </div>
              </div>
            </div>

            {/* Dropdown Results */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 dashboard-card bg-zinc-900 border-white/10 shadow-2xl overflow-hidden shadow-black/80">
                <div className="max-h-[360px] overflow-y-auto">
                  {filteredMedicines.map(med => (
                    <button
                      key={med._id}
                      onClick={() => handleSelectMedicine(med)}
                      className="w-full flex items-center justify-between p-4 hover:bg-teal-500/5 group transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-white tracking-tight">{med.name}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{med.manufacturer}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-sm font-bold text-teal-400">₹{med.sellingPrice}</p>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          med.stock <= med.reorderLevel ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {med.stock} in stock
                        </div>
                        <ChevronRight size={16} className="text-zinc-700 group-hover:text-teal-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Table Area */}
          <div className="dashboard-card flex-1 flex flex-col min-h-0 bg-[#0c0c0e]">
             <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">Cart Items</h3>
                <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-white/5">{cartItems.length} Products</span>
             </div>

             <div className="flex-1 overflow-auto">
                <table className="w-full border-collapse">
                   <thead className="sticky top-0 bg-[#0c0c0e] z-10">
                      <tr className="border-b border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                         <th className="p-5 text-left w-12 font-bold">#</th>
                         <th className="p-5 text-left font-bold">Product</th>
                         <th className="p-5 text-center w-32 font-bold">Price</th>
                         <th className="p-5 text-center w-36 font-bold">Quantity</th>
                         <th className="p-5 text-right w-32 font-bold">Subtotal</th>
                         <th className="p-5 w-16 font-bold"></th>
                      </tr>
                   </thead>
                   <tbody>
                      {cartItems.length > 0 ? (
                        cartItems.map((item, idx) => (
                           <tr key={item._id} className="group border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors">
                              <td className="p-5 text-sm text-zinc-600 font-medium">{idx + 1}</td>
                              <td className="p-5">
                                 <div>
                                    <p className="text-sm font-bold text-white">{item.name}</p>
                                    <p className="text-[10px] text-zinc-600 font-medium uppercase mt-0.5">ID: {item._id.slice(-6)}</p>
                                 </div>
                              </td>
                              <td className="p-5 text-center text-sm font-medium text-zinc-300">₹{item.sellingPrice}</td>
                              <td className="p-5">
                                 <div className="flex items-center justify-center bg-zinc-900 border border-white/5 rounded-lg w-fit mx-auto px-1 py-1">
                                    <button
                                      onClick={() => updateQuantity(item._id, -1)}
                                      className="h-7 w-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-zinc-400 font-bold"
                                    >−</button>
                                    <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item._id, 1)}
                                      className="h-7 w-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-zinc-400 font-bold"
                                    >+</button>
                                 </div>
                              </td>
                              <td className="p-5 text-right text-sm font-bold text-white">₹{(item.sellingPrice * item.quantity).toFixed(2)}</td>
                              <td className="p-5 text-right">
                                 <button
                                   onClick={() => removeItem(item._id)}
                                   className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-zinc-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 size={15} />
                                 </button>
                              </td>
                           </tr>
                        ))
                      ) : (
                        <tr>
                           <td colSpan={6} className="p-20 text-center">
                              <div className="flex flex-col items-center gap-3 text-zinc-600">
                                 <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center">
                                    <ShoppingCart size={24} strokeWidth={1.5} />
                                 </div>
                                 <p className="text-sm font-medium">Your cart is empty</p>
                              </div>
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Right side: Summary and Checkout */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0 h-full">
           <div className="dashboard-card p-6 space-y-6">
              <div>
                 <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Customer Info</h3>
                 <div className="space-y-3">
                    <div className="relative group">
                       <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-teal-500 transition-colors" />
                       <input
                         type="text"
                         placeholder="Customer Name"
                         className="input pl-10 border-white/5 bg-zinc-900/50"
                         value={customerName}
                         onChange={e => setCustomerName(e.target.value)}
                       />
                    </div>
                    <div className="relative group">
                       <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-teal-500 transition-colors" />
                       <input
                         type="text"
                         placeholder="Phone Number"
                         className="input pl-10 border-white/5 bg-zinc-900/50"
                         value={customerPhone}
                         onChange={e => setCustomerPhone(e.target.value)}
                       />
                    </div>
                 </div>
              </div>

              <div>
                 <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Payment Method</h3>
                 <div className="grid grid-cols-3 gap-2">
                    {(['Cash', 'UPI', 'Card'] as const).map(method => {
                      const Icon = method === 'Cash' ? Banknote : method === 'UPI' ? Smartphone : CreditCard;
                      return (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            paymentMethod === method
                              ? 'bg-teal-500/10 border-teal-500 text-teal-400'
                              : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-[10px] font-bold uppercase">{method}</span>
                        </button>
                      );
                    })}
                 </div>
              </div>
           </div>

           <div className="dashboard-card p-6 bg-teal-500/[0.02] border-teal-500/10 flex-col flex mt-auto">
              <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Subtotal</span>
                    <span className="text-sm font-bold text-white">₹{total.toFixed(2)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Tax / GST</span>
                    <span className="text-sm font-bold text-white">₹0.00</span>
                 </div>
                 <div className="h-px bg-white/5" />
                 <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-white">Grand Total</span>
                    <span className="text-2xl font-bold text-teal-400">₹{total.toLocaleString()}</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <button
                   onClick={handleCheckout}
                   disabled={cartItems.length === 0 || isSubmitting}
                   className="btn btn-primary w-full py-4 rounded-xl text-[14px] disabled:opacity-30 flex items-center justify-center gap-2 group"
                 >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <Printer size={18} />
                        <span className="font-bold">Complete & Print</span>
                        <div className="ml-2 px-1.5 py-0.5 rounded bg-black/10 text-[9px] font-bold uppercase border border-black/10">F10</div>
                      </>
                    )}
                 </button>

                 {!showClearConfirm ? (
                   <button
                     onClick={() => setShowClearConfirm(true)}
                     disabled={cartItems.length === 0}
                     className="w-full text-center text-xs font-bold text-zinc-600 hover:text-rose-500 transition-colors py-2 uppercase tracking-widest"
                   >
                     Clear Cart
                   </button>
                 ) : (
                   <div className="flex items-center gap-2 p-2 bg-zinc-900 border border-white/5 rounded-xl">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase flex-1 ml-2">Clear all?</span>
                      <button onClick={handleClearSession} className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-lg uppercase">Confirm</button>
                      <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-lg uppercase">No</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Success Modal */}
      {lastSale && (
        <div className="modal-overlay">
          <div className="dashboard-card bg-[#09090b] p-10 max-w-md w-full border-teal-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             <div className="h-20 w-20 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6 text-teal-500 border border-teal-500/20">
                <CheckCircle size={40} strokeWidth={1.5} />
             </div>
             <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Invoice Generated</h2>
                <p className="text-zinc-500 text-sm mt-1">Receipt Number: #{lastSale.invoiceNumber}</p>
             </div>

             <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-medium pr-1">
                   <span className="text-zinc-500">Customer</span>
                   <span className="text-white">{lastSale.customerName || 'Standard Client'}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium pr-1">
                   <span className="text-zinc-500">Amount Paid</span>
                   <span className="text-lg font-bold text-teal-400">₹{lastSale.grandTotal}</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button
                   onClick={() => { window.print(); setLastSale(null); }}
                   className="btn btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                   <Printer size={16} /> Print
                </button>
                <button
                   onClick={() => setLastSale(null)}
                   className="btn btn-secondary py-3 rounded-xl font-bold"
                >
                   Dismiss
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
