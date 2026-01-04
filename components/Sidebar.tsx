
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, user, onLogout }) => {
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
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">L</span>
          Lumina Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeView === item.id
                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 space-y-3 border-t border-gray-100">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
              className="w-10 h-10 rounded-full border border-gray-200" 
              alt="Profile" 
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
