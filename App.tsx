
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const savedUser = localStorage.getItem('lumina_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('lumina_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_session');
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-200 rounded-xl mb-4"></div>
          <div className="h-2 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'inventory':
        return <Inventory />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'payments':
        return <Payments />;
      case 'shipping':
        return <Shipping />;
      case 'content':
        return <Content />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400 space-y-4">
            <span className="text-6xl">🚧</span>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-600">{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View</h3>
              <p>This module is currently under development in the SaaS roadmap.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      <AICommandCenter onNavigate={(view) => setActiveView(view)} />

      {/* Persistent Call to Action / Support Floating Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 group">
        <span className="text-2xl">💬</span>
        <span className="absolute right-full mr-4 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Contact Support
        </span>
      </button>
    </div>
  );
};

export default App;
