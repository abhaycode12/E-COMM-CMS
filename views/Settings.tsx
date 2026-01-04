import React, { useState } from 'react';
import { SystemSettings } from '../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    store_name: 'Lumina Premium Store',
    store_email: 'hello@luminastore.com',
    currency: 'USD',
    timezone: 'UTC',
    maintenance_mode: false,
    api_keys: {
      stripe_publishable: 'pk_test_********************',
      stripe_secret: 'sk_test_********************',
      google_maps: 'AIzaSy**********************'
    }
  });

  const [activeGroup, setActiveGroup] = useState<'general' | 'payments' | 'integration' | 'subscription'>('general');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Configuration</h2>
          <p className="text-gray-500 mt-1">Core engine parameters, API integrations, and billing.</p>
        </div>
        <button className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
          Save All Changes
        </button>
      </header>

      <div className="flex gap-8">
        {/* Navigation Rail */}
        <div className="w-64 space-y-1">
          {[
            { id: 'general', label: 'General Store', icon: '🏠' },
            { id: 'payments', label: 'Checkout & Tax', icon: '💳' },
            { id: 'integration', label: 'Third-party APIs', icon: '🔗' },
            { id: 'subscription', label: 'SaaS Plan', icon: '💎' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveGroup(item.id as any)}
              className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${
                activeGroup === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px]">
          {activeGroup === 'general' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Store Official Name</label>
                  <input 
                    type="text" 
                    value={settings.store_name}
                    onChange={e => setSettings({...settings, store_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Support Email</label>
                  <input 
                    type="email" 
                    value={settings.store_email} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Base Currency</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none appearance-none text-gray-900">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                <div className="flex justify-between items-center p-6 bg-red-50 border border-red-100 rounded-3xl">
                   <div>
                     <h4 className="text-red-900 font-black">Maintenance Mode</h4>
                     <p className="text-red-600 text-xs font-medium">Take the storefront offline for scheduled upgrades.</p>
                   </div>
                   <div className="relative inline-block w-12 h-6 transition duration-200 ease-in bg-gray-200 rounded-full cursor-pointer">
                      <input type="checkbox" className="absolute w-6 h-6 bg-white border-2 border-gray-200 rounded-full appearance-none cursor-pointer checked:right-0 checked:bg-red-600" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeGroup === 'payments' && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-4">
                 <h4 className="text-indigo-900 font-black">Checkout Optimization</h4>
                 <p className="text-indigo-600 text-xs leading-relaxed">Customize your payment flows and automatic tax calculation logic.</p>
               </div>
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                    <span className="font-bold text-gray-700">Enable Guest Checkout</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                 </div>
                 <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                    <span className="font-bold text-gray-700">Require Phone Number for Orders</span>
                    <input type="checkbox" className="w-5 h-5 accent-indigo-600" />
                 </div>
                 <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                    <span className="font-bold text-gray-700">Automatic Invoice PDF Generation</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600" />
                 </div>
               </div>
            </div>
          )}

          {activeGroup === 'integration' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stripe Gateway Configuration</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <input 
                      type="text" 
                      placeholder="Stripe Publishable Key" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono text-xs outline-none text-gray-900" 
                      defaultValue={settings.api_keys.stripe_publishable} 
                    />
                    <input 
                      type="password" 
                      placeholder="Stripe Secret Key" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono text-xs outline-none text-gray-900" 
                      defaultValue={settings.api_keys.stripe_secret} 
                    />
                 </div>
               </div>
               <div className="space-y-4 pt-8">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Google Cloud Services</h4>
                 <input 
                    type="text" 
                    placeholder="Maps API Key" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono text-xs outline-none text-gray-900" 
                    defaultValue={settings.api_keys.google_maps} 
                 />
               </div>
            </div>
          )}

          {activeGroup === 'subscription' && (
             <div className="space-y-10 animate-in fade-in duration-300">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-10 rounded-[3rem] text-white relative overflow-hidden">
                   <div className="relative z-10">
                     <span className="bg-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Enterprise Plan</span>
                     <h3 className="text-4xl font-black mt-4 mb-2">Infinite Scaling</h3>
                     <p className="text-indigo-200 text-sm max-w-xs">Your organization is currently on the top-tier SaaS plan. Unlocked all premium features.</p>
                     <button className="mt-8 bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black hover:bg-indigo-50 transition-all">Manage Billing</button>
                   </div>
                   <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Staff Seats</p>
                      <p className="text-2xl font-black text-gray-900">12 / 50</p>
                   </div>
                   <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly API Calls</p>
                      <p className="text-2xl font-black text-gray-900">2.4M / 10M</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;