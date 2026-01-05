import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line, Area
} from 'recharts';
import { SalesAnalyticsItem, CategorySalesPerformance, GeographicPerformance, TaxReportLine } from '../types';
import { analyzeSalesTrends } from '../services/geminiService';

interface AnalyticsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
  removeNotify?: (id: string) => void;
}

const MOCK_SALES_TIME_SERIES: SalesAnalyticsItem[] = [
  { date: '2025-02-10', revenue: 4500, orders: 42, aov: 107, profit: 1200 },
  { date: '2025-02-11', revenue: 5200, orders: 48, aov: 108, profit: 1450 },
  { date: '2025-02-12', revenue: 3800, orders: 35, aov: 108, profit: 980 },
  { date: '2025-02-13', revenue: 6100, orders: 55, aov: 110, profit: 1800 },
  { date: '2025-02-14', revenue: 7500, orders: 68, aov: 110, profit: 2200 },
  { date: '2025-02-15', revenue: 8200, orders: 75, aov: 109, profit: 2500 },
  { date: '2025-02-16', revenue: 5900, orders: 50, aov: 118, profit: 1600 },
];

const MOCK_CATEGORY_PERFORMANCE: CategorySalesPerformance[] = [
  { category: 'Footwear', revenue: 45000, units: 350, margin: 28 },
  { category: 'Apparel', revenue: 32000, units: 1200, margin: 42 },
  { category: 'Electronics', revenue: 85000, units: 180, margin: 15 },
  { category: 'Accessories', revenue: 12000, units: 450, margin: 35 },
];

const MOCK_GEO_DATA: GeographicPerformance[] = [
  { region: 'North', city: 'Chicago', orders: 145, revenue: 15600 },
  { region: 'West', city: 'Los Angeles', orders: 230, revenue: 28900 },
  { region: 'East', city: 'New York', orders: 198, revenue: 24500 },
  { region: 'South', city: 'Houston', orders: 112, revenue: 12400 },
];

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#6366f1'];

const Analytics: React.FC<AnalyticsProps> = ({ notify, removeNotify }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'categories' | 'geo' | 'financials'>('sales');
  const [aiInsights, setAiInsights] = useState<string>('Synthesizing regional performance metrics...');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    handleRefreshInsights();
  }, [activeTab]);

  const handleRefreshInsights = async () => {
    setIsGenerating(true);
    const dataForAI = activeTab === 'sales' ? MOCK_SALES_TIME_SERIES : 
                     activeTab === 'categories' ? MOCK_CATEGORY_PERFORMANCE :
                     activeTab === 'geo' ? MOCK_GEO_DATA : [];
                     
    const insights = await analyzeSalesTrends({ segment: activeTab, data: dataForAI });
    setAiInsights(insights || 'Deep learning analysis currently offline.');
    setIsGenerating(false);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const loadId = notify?.(`Compiling ${format.toUpperCase()} business report...`, 'loading');
    setTimeout(() => {
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.(`Report job successful. File dispatched for download.`, 'success');
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Business Intelligence</h2>
          <p className="text-gray-500 mt-2 font-medium">Holistic real-time analysis across sales, regional trends, and compliance.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
          <button onClick={() => handleExport('pdf')} className="flex-1 lg:flex-none px-8 py-4 bg-gray-50 text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 flex items-center justify-center gap-3">
            <span>📄</span> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex-1 lg:flex-none px-8 py-4 bg-gray-50 text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 flex items-center justify-center gap-3">
            <span>📊</span> Excel
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Responsive Side Menu */}
        <div className="lg:w-72 border-r border-gray-100 bg-gray-50/20 p-6 space-y-2">
          {[
            { id: 'sales', label: 'Gross Revenue', icon: '📈' },
            { id: 'categories', label: 'Category Alpha', icon: '🏷️' },
            { id: 'geo', label: 'Regional Demand', icon: '🌍' },
            { id: 'financials', label: 'Tax & Compliance', icon: '⚖️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-4 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div className="mt-10 p-6 bg-indigo-900 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
            <h5 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Lumina AI Agent</h5>
            <p className="text-[11px] font-bold leading-relaxed mb-6 group-hover:text-indigo-200 transition-colors">Gemini is crunching your performance matrix...</p>
            <button 
              onClick={handleRefreshInsights}
              disabled={isGenerating}
              className="w-full py-3 bg-white text-indigo-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Analyzing...' : 'Refresh Intel'}
            </button>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Dynamic Charting Zone */}
        <div className="flex-1 p-6 md:p-10 lg:p-16 min-h-[600px]">
          {activeTab === 'sales' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-colors cursor-default">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Volume</p>
                  <p className="text-4xl font-black text-gray-900 leading-none">$1.4M</p>
                  <p className="text-xs text-green-600 font-black mt-3 flex items-center gap-1">↑ 12.4% <span className="opacity-40">vs prev</span></p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-colors cursor-default">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Profit Net</p>
                  <p className="text-4xl font-black text-gray-900 leading-none">$420K</p>
                  <p className="text-xs text-indigo-600 font-black mt-3 flex items-center gap-1">↑ 8.2% <span className="opacity-40">optimized</span></p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-colors cursor-default">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AOV Cycle</p>
                  <p className="text-4xl font-black text-gray-900 leading-none">$112</p>
                  <p className="text-xs text-amber-600 font-black mt-3 flex items-center gap-1">Stable <span className="opacity-40">standard</span></p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={MOCK_SALES_TIME_SERIES}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                    />
                    <Area type="monotone" dataKey="revenue" fill="#4f46e5" fillOpacity={0.05} stroke="none" />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={40} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="bg-gray-50 p-8 rounded-[3rem] h-[400px] border border-gray-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Revenue Spread</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_CATEGORY_PERFORMANCE}
                          cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8}
                          dataKey="revenue" nameKey="category"
                        >
                          {MOCK_CATEGORY_PERFORMANCE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="bg-white p-8 rounded-[3rem] h-[400px] border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Operational Margin %</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_CATEGORY_PERFORMANCE}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                        <Tooltip />
                        <Bar dataKey="margin" fill="#818cf8" radius={[12, 12, 12, 12]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {MOCK_GEO_DATA.map(geo => (
                   <div key={geo.city} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-default group">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-indigo-600 transition-colors">{geo.region} Node</p>
                      <h5 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-6">{geo.city}</h5>
                      <div className="space-y-3 pt-6 border-t border-gray-50">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-400">Revenue:</span>
                          <span className="text-gray-900">${geo.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-400">Units:</span>
                          <span className="text-indigo-600">{geo.orders}</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Floating Insight Panel */}
        <div className="lg:w-80 bg-indigo-50/30 p-8 border-l border-gray-100 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                <span className="text-2xl">✨</span> Insights Ledger
              </h3>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">Analysis Context: {activeTab}</p>
            </div>
            <div className="space-y-8 text-gray-600 text-sm font-medium leading-relaxed italic">
              {aiInsights}
            </div>
          </div>
          <div className="mt-12 p-8 bg-white border border-indigo-100 rounded-[2.5rem] shadow-xl shadow-indigo-100/50">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Strategic recommendation</p>
             <p className="text-xs font-black text-gray-900 leading-relaxed mb-6">"Category drift detected in {activeTab}. Shift 15% marketing budget to performance Apparel for Q2."</p>
             <button className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-6 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all w-full">Execute Strategy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;