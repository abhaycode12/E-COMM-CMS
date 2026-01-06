import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AICommandCenter from './components/AICommandCenter';
import Dashboard from './views/Dashboard';
import Products from './views/Products';
import Categories from './views/Categories';
import Customers from './views/Customers';
import Orders from './views/Orders';
import Inventory from './views/Inventory';
import Payments from './views/Payments';
import Shipping from './views/Shipping';
import Content from './views/Content';
import Analytics from './views/Analytics';
import Users from './views/Users';
import Settings from './views/Settings';
import Login from './views/Login';
import { User } from './types';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading';
  message: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAICommandOpen, setIsAICommandOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumina_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'loading' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    if (type !== 'loading') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 4000);
    }
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('lumina_session', JSON.stringify(userData));
    addNotification(`Authentication Successful. Welcome, ${userData.name}.`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_session');
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 font-black text-xs uppercase tracking-[0.3em] text-gray-400">Initializing Lumina OS</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    const viewProps = { notify: addNotification, removeNotify: removeNotification };
    switch (activeView) {
      case 'dashboard': return <Dashboard {...viewProps} />;
      case 'products': return <Products {...viewProps} />;
      case 'categories': return <Categories {...viewProps} />;
      case 'inventory': return <Inventory {...viewProps} />;
      case 'orders': return <Orders {...viewProps} />;
      case 'customers': return <Customers {...viewProps} />;
      case 'payments': return <Payments {...viewProps} />;
      case 'shipping': return <Shipping {...viewProps} />;
      case 'content': return <Content {...viewProps} />;
      case 'analytics': return <Analytics {...viewProps} />;
      case 'users': return <Users {...viewProps} />;
      case 'settings': return <Settings {...viewProps} />;
      default: return <Dashboard {...viewProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Top Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-[110]">
        <h1 className="text-xl font-black text-indigo-600 tracking-tighter">Lumina Admin</h1>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-gray-50 rounded-xl text-gray-600"
        >
          {isMobileSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Notifications Portal */}
      <div className="fixed top-6 right-6 z-[999] space-y-3 pointer-events-none w-full max-w-[320px]">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`
              pointer-events-auto p-5 rounded-[1.5rem] shadow-2xl border-l-4 flex items-start gap-4 animate-in slide-in-from-right-8 duration-500 bg-white
              ${n.type === 'success' ? 'border-green-500 shadow-green-100' : ''}
              ${n.type === 'error' ? 'border-red-500 shadow-red-100' : ''}
              ${n.type === 'info' ? 'border-indigo-500 shadow-indigo-100' : ''}
              ${n.type === 'loading' ? 'border-amber-400 shadow-amber-100' : ''}
            `}
          >
            {n.type === 'loading' ? (
              <div className="w-5 h-5 border-2 border-amber-100 border-t-amber-500 rounded-full animate-spin mt-1"></div>
            ) : (
              <span className="text-xl shrink-0">{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}</span>
            )}
            <div>
              <p className="font-black text-gray-900 text-xs uppercase tracking-widest mb-1">{n.type}</p>
              <p className="font-bold text-gray-600 text-sm leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>

      <Sidebar 
        activeView={activeView} 
        setActiveView={(v) => { setActiveView(v); setIsMobileSidebarOpen(false); }} 
        user={user} 
        onLogout={handleLogout} 
        onOpenAI={() => setIsAICommandOpen(true)}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[90]"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-h-screen overflow-y-auto custom-scrollbar flex flex-col relative lg:ml-64 transition-all duration-300">
        <div className="max-w-[1400px] w-full mx-auto p-4 md:p-8 lg:p-12 animate-in fade-in duration-700">
          {renderView()}
        </div>
      </main>

      <AICommandCenter 
        isOpen={isAICommandOpen} 
        setIsOpen={setIsAICommandOpen} 
        onNavigate={(view) => setActiveView(view)} 
      />
    </div>
  );
};

export default App;