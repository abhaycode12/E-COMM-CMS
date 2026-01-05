import React from 'react';
import { User } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  user: User;
  onLogout: () => void;
  onOpenAI: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, user, onLogout, onOpenAI, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['super-admin', 'admin', 'manager', 'support', 'warehouse'] },
    { id: 'categories', label: 'Categories', icon: '📁', roles: ['super-admin', 'admin', 'manager'] },
    { id: 'products', label: 'Products', icon: '📦', roles: ['super-admin', 'admin', 'manager'] },
    { id: 'inventory', label: 'Inventory', icon: '🏗️', roles: ['super-admin', 'admin', 'manager', 'warehouse'] },
    { id: 'orders', label: 'Orders', icon: '🛒', roles: ['super-admin', 'admin', 'manager', 'support', 'warehouse'] },
    { id: 'customers', label: 'Customers', icon: '👥', roles: ['super-admin', 'admin', 'support'] },
    { id: 'payments', label: 'Payments', icon: '💳', roles: ['super-admin', 'admin'] },
    { id: 'shipping', label: 'Shipping', icon: '🚚', roles: ['super-admin', 'admin', 'manager', 'warehouse'] },
    { id: 'analytics', label: 'Reports', icon: '📈', roles: ['super-admin', 'admin'] },
    { id: 'users', label: 'Users & Roles', icon: '🔐', roles: ['super-admin', 'admin'] },
    { id: 'content', label: 'CMS Content', icon: '🎨', roles: ['super-admin', 'admin', 'manager'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['super-admin', 'admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className={`
      w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col z-[100] shadow-sm transition-transform duration-500 ease-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-8 flex justify-between items-center">
        <h1 className="text-xl font-black text-indigo-600 flex items-center gap-3 tracking-tighter">
          <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">L</span>
          <div className="leading-none">
            <p className="text-gray-900">Lumina</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Admin v4.0</p>
          </div>
        </h1>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-900">✕</button>
        )}
      </div>

      <div className="px-6 mb-8">
        <button 
          onClick={onOpenAI}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-[1.5rem] bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 group"
        >
          <span className="text-lg group-hover:animate-bounce">✨</span>
          <span>AI Command</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
              activeView === item.id
                ? 'bg-indigo-50 text-indigo-600 font-black shadow-inner'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <span className={`text-xl transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'grayscale opacity-60'}`}>{item.icon}</span>
            <span className="text-xs uppercase font-black tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-6 border-t border-gray-50">
        <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 group transition-all hover:bg-white hover:shadow-xl hover:border-indigo-100">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
              className="w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover" 
              alt="Profile" 
            />
            <div className="overflow-hidden">
              <p className="text-xs font-black text-gray-900 truncate tracking-tight">{user.name}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-500 mt-0.5">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;