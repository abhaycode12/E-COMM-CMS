
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../components/StatCard';
import { analyzeSalesTrends } from '../services/geminiService';

const salesData = [
  { name: 'Mon', sales: 4000, orders: 240 },
  { name: 'Tue', sales: 3000, orders: 198 },
  { name: 'Wed', sales: 2000, orders: 120 },
  { name: 'Thu', sales: 2780, orders: 150 },
  { name: 'Fri', sales: 1890, orders: 110 },
  { name: 'Sat', sales: 2390, orders: 130 },
  { name: 'Sun', sales: 3490, orders: 210 },
];

const Dashboard: React.FC = () => {
  const [aiInsights, setAiInsights] = useState<string>('Analyzing trends...');
  const [shortcutText, setShortcutText] = useState('⌘K');

  useEffect(() => {
    const fetchInsights = async () => {
      const insights = await analyzeSalesTrends(salesData);
      setAiInsights(insights || 'No insights available.');
    };
    fetchInsights();

    // Set shortcut text based on OS
    const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    setShortcutText(isMac ? '⌘K' : 'Ctrl+K');
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h2>
          <p className="text-gray-500">Lumina is monitoring your business in real-time. Use <kbd className="bg-white px-2 py-0.5 rounded-lg border-2 border-gray-200 text-xs font-black shadow-sm text-indigo-600">{shortcutText}</kbd> to command.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 border border-gray-200 rounded-2xl bg-white text-gray-600 font-bold hover:bg-gray-50 transition-all">Export Report</button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Add Product</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value="$128,430" trend={12.5} icon="💰" />
        <StatCard label="Total Orders" value="1,240" trend={8.2} icon="🛒" />
        <StatCard label="Active Customers" value="842" trend={-2.4} icon="👥" />
        <StatCard label="Conversion Rate" value="3.42%" trend={4.1} icon="⚡" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Trajectory</h3>
            <select className="text-xs font-black uppercase tracking-widest bg-gray-50 border-none rounded-xl px-4 py-2">
              <option>Cycle: Last 7 Days</option>
              <option>Cycle: Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#4f46e5', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden relative flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <span className="text-2xl">✨</span> Lumina Assistant
            </h3>
            <div className="space-y-6 text-indigo-100 text-sm leading-relaxed whitespace-pre-line font-medium italic">
              {aiInsights}
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 relative z-10">
             <h5 className="text-[10px] font-black uppercase tracking-widest mb-3 text-indigo-300">Predictive Action</h5>
             <p className="text-xs text-indigo-100 font-bold">"Electronics category stock is depleting 12% faster than last week. Generate a restock order?"</p>
             <button className="mt-4 text-[10px] font-black bg-white text-indigo-900 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all">Yes, Prepare PO</button>
          </div>

          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Recent Manifests</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between p-5 border border-gray-50 rounded-[2rem] hover:bg-gray-50 cursor-pointer transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">#ORD</div>
                  <div>
                    <p className="font-black text-gray-900 leading-tight text-sm">Order #32{i}1</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Sarah Jenkins • 2 mins ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">$249.00</p>
                  <span className="text-[9px] uppercase tracking-widest font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg mt-1 inline-block">Success</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Demand Heatmap</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" fill="#4f46e5" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
