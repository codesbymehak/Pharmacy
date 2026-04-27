import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  History,
  ReceiptText,
  TrendingUp,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/medicines', icon: Pill },
    { name: 'Checkout', path: '/pos', icon: ShoppingCart },
    { name: 'Sales', path: '/sales', icon: History },
  ];

  if (isAdmin) {
    menuItems.push(
      { name: 'Expenses', path: '/expenses', icon: ReceiptText },
      { name: 'Analytics', path: '/reports', icon: TrendingUp },
      { name: 'Staff', path: '/users', icon: Users }
    );
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'F2':
          e.preventDefault();
          navigate('/pos');
          break;
        case 'F3':
          e.preventDefault();
          navigate('/medicines');
          break;
        case 'F4':
          e.preventDefault();
          navigate('/expenses');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-400 font-sans selection:bg-teal-500/30">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/5 bg-[#121212] transition-all duration-300 ease-in-out z-50 ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-teal-500 flex items-center justify-center text-white">
              <Plus size={18} strokeWidth={3} />
            </div>
            {sidebarExpanded && (
              <span className="text-lg font-bold text-white tracking-tight">PharmaCenter</span>
            )}
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 mb-10 mt-6">
           <div className={`flex items-center gap-3 ${!sidebarExpanded && 'justify-center'}`}>
              <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0">
                 {user?.name?.[0]}
              </div>
              {sidebarExpanded && (
                <div className="min-w-0 flex-1">
                   <p className="text-xs font-bold text-white truncate">{user?.name} Admin</p>
                   <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-none mt-1">Admin</p>
                </div>
              )}
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#e2f5f1] text-[#14b8a6] font-bold' 
                    : 'text-zinc-500 hover:text-zinc-300'
                } ${!sidebarExpanded && 'justify-center'}`}
              >
                <item.icon size={18} className={`${isActive ? 'text-[#14b8a6]' : 'text-zinc-600'}`} />
                {sidebarExpanded && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto space-y-4">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-white transition-all ${!sidebarExpanded && 'justify-center'}`}
          >
            {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            {sidebarExpanded && <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>}
          </button>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-white transition-all ${!sidebarExpanded && 'justify-center'}`}
          >
            <ChevronRight size={16} className="rotate-180" />
            {sidebarExpanded && <span className="text-xs font-bold uppercase tracking-widest">Sign out</span>}
          </button>
          {sidebarExpanded && (
             <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest px-3 pt-4 border-t border-white/5">
                v1.4.0 Premium · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
             </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative">
        <main className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar">
           <Outlet />
        </main>
      </div>
    </div>
  );
}
