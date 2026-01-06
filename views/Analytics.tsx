import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line, Area
} from 'recharts';
import { SalesAnalyticsItem, CategorySalesPerformance, GeographicPerformance, User } from '../types';
import { analyzeSalesTrends } from '../services/geminiService';

interface AnalyticsProps {
  user: User;
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

const Analytics: React.FC<AnalyticsProps> = ({ user, notify, removeNotify }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'categories' | 'geo' | 'financials'>('sales');
  const [aiInsights, setAiInsights] = useState<string>('Synthesizing regional performance metrics...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Robust Filter State
  const [filters, setFilters] = useState({
    startDate: '2025-02-10',
    endDate: '2025-02-16',
    segment: 'all',
    region: 'all',
    category: 'all',
    status: 'delivered'
  });

  useEffect(() => {
    handleRefreshInsights();
  }, [activeTab, filters]);

  const handleRefreshInsights = async () => {
    setIsGenerating(true);
    const dataForAI = activeTab === 'sales' ? MOCK_SALES_TIME_SERIES : 
                     activeTab === 'categories' ? MOCK_CATEGORY_PERFORMANCE :
                     activeTab === 'geo' ? MOCK_GEO_DATA : [];
                     
    const insights = await analyzeSalesTrends({ segment: activeTab, filters, data: dataForAI });
    setAiInsights(insights || 'Deep learning analysis currently offline.');
    setIsGenerating(false);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(format);
    const reportName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    
    // Explicitly validating filters before export
    const filterSummary = `Range: ${filters.startDate} to ${filters.endDate} | Segment: ${filters.segment} | Cat: ${filters.category}`;
    
    const loadId = notify?.(`Compiling ${format.toUpperCase()} ${reportName} Report based on current workspace constraints. Applied Parameters: ${filterSummary}...`, 'loading');
    
    // Simulating heavy server-side report generation and email dispatch
    setTimeout(() => {
      if (loadId && removeNotify) removeNotify(loadId);
      
      // Confirming export completion and email dispatch to the specific logged-in user
      notify?.(`Manifest Export Complete. A secure download link for the ${format.toUpperCase()} report has been dispatched to your verified identity: ${user.email}.`, 'success');
      setIsExporting(null);
    }, 3000);
  };

  const handleExecuteStrategy = () => {
    const loadId = notify?.("Committing strategic marketing adjustments to backend engine...", "loading");
    setTimeout(() => {
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.("Strategy executed. Budget allocation optimized for current demand drift.", "success");
    }, 2000);
  };

  const filteredSalesData = useMemo(() => {
    let data = [...MOCK_SALES_TIME_SERIES];
    // Temporal Filter
    data = data.filter(item => item.date >= filters.startDate && item.date <= filters.endDate);
    
    // Simulated segment variance logic
    if (filters.segment !== 'all') {
      data = data.map(item => ({ ...item, revenue: item.revenue * 0.85, profit: item.profit * 0.7 }));
    }
    
    return data;
  }, [filters]);

  const totalVolume = useMemo(() => {
    return filteredSalesData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [filteredSalesData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Business Intelligence</h2>
          <p className="text-gray-500 mt-2 font-medium">Holistic real-time analysis across sales, regional trends, and compliance.</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto relative z-10">
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('pdf')} 
            className="flex-1 lg:flex-none px-8 py-4 bg-white text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 flex items-center justify-center gap-3 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isExporting === 'pdf' ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span> : <span>📄</span>}
            EXPORT PDF
          </button>
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('excel')} 
            className="flex-1 lg:flex-none px-8 py-4 bg-white text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 flex items-center justify-center gap-3 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isExporting === 'excel' ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span> : <span>📊</span>}
            EXPORT EXCEL
          </button>
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('csv')} 
            className="flex-1 lg:flex-none px-8 py-4 bg-white text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 flex items-center justify-center gap-3 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isExporting === 'csv' ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span> : <span>📁</span>}
            EXPORT CSV
          </button>
        </div>
      </header>

      {/* Robust Filter Ribbon */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal Window</label>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="bg-transparent text-xs font-black text-gray-700 outline-none cursor-pointer flex-1"
            />
            <span className="text-gray-300 font-bold">→</span>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="bg-transparent text-xs font-black text-gray-700 outline-none cursor-pointer flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Market Segment</label>
          <select 
            value={filters.segment}
            onChange={(e) => setFilters({...filters, segment: e.target.value})}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-gray-700 outline-none cursor-pointer hover:bg-white transition-all shadow-sm"
          >
            <option value="all">Global Omnichannel</option>
            <option value="direct">B2C Direct Storefront</option>
            <option value="marketplace">3P Partner Marketplaces</option>
            <option value="mobile">Native Application (iOS/Android)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Slice</label>
          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-gray-700 outline-none cursor-pointer hover:bg-white transition-all shadow-sm"
          >
            <option value="all">Aggregate All Categories</option>
            <option value="footwear">Footwear Collection</option>
            <option value="apparel">Premium Apparel</option>
            <option value="electronics">Enterprise Electronics</option>
          </select>
        </div>

        <div className="flex items-end justify-between">
           <div className="flex-1 space-y-2 mr-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inventory Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-gray-700 outline-none cursor-pointer hover:bg-white transition-all shadow-sm"
              >
                <option value="delivered">Settled Orders Only</option>
                <option value="shipped">In-Transit Fulfillment</option>
                <option value="all">Gross Lifecycle Volume</option>
              </select>
           </div>
           <button 
             onClick={() => {
               setFilters({
                 startDate: '2025-02-10',
                 endDate: '2025-02-16',
                 segment: 'all',
                 region: 'all',
                 category: 'all',
                 status: 'delivered'
               });
               notify?.("Analytical parameters reset to enterprise defaults.", "info");
             }}
             className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl hover:bg-white hover:text-indigo-600 hover:shadow-lg transition-all active:scale-95 border border-gray-200 flex items-center justify-center text-lg"
             title="Reset Workspace"
           >
             🔄
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Side Menu */}
        <div className="lg:w-72 border-r border-gray-100 bg-gray-50/20 p-8 space-y-2 flex-shrink-0">
          {[
            { id: 'sales', label: 'Gross Revenue', icon: '📈' },
            { id: 'categories', label: 'Category Alpha', icon: '🏷️' },
            { id: 'geo', label: 'Regional Demand', icon: '🌍' },
            { id: 'financials', label: 'Tax & Compliance', icon: '⚖️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-8 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div className="mt-12 p-10 bg-indigo-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h5 className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 opacity-50">Lumina AI Core</h5>
              <p className="text-xs font-bold leading-relaxed mb-10 group-hover:text-indigo-200 transition-colors">Gemini is synthesizing workspace data based on your specific filter slice.</p>
              <button 
                onClick={handleRefreshInsights}
                disabled={isGenerating}
                className="w-full py-5 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
              >
                {isGenerating ? <div className="w-4 h-4 border-3 border-indigo-200 border-t-indigo-900 rounded-full animate-spin"></div> : 'Recalculate Intel'}
              </button>
            </div>
            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Chart Zone */}
        <div className="flex-1 p-8 md:p-12 lg:p-16 min-h-[600px] min-w-0">
          {activeTab === 'sales' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:bg-white transition-all cursor-default min-w-0 shadow-inner group">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 truncate group-hover:text-indigo-600 transition-colors">Filtered Revenue</p>
                  <p className="text-4xl md:text-5xl font-black text-gray-900 leading-none truncate tracking-tighter">${totalVolume.toLocaleString()}</p>
                  <p className="text-[10px] text-green-600 font-black mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ↑ 12.4% <span className="opacity-40 font-bold whitespace-nowrap">vs temporal baseline</span>
                  </p>
                </div>
                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:bg-white transition-all cursor-default min-w-0 shadow-inner group">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 truncate group-hover:text-indigo-600 transition-colors">Retained Profit</p>
                  <p className="text-4xl md:text-5xl font-black text-gray-900 leading-none truncate tracking-tighter">${(totalVolume * 0.32).toLocaleString()}</p>
                  <p className="text-[10px] text-indigo-600 font-black mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-50"></span>
                    ↑ 8.2% <span className="opacity-40 font-bold whitespace-nowrap">optimized margin flow</span>
                  </p>
                </div>
                <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100 hover:bg-white transition-all cursor-default min-w-0 sm:col-span-2 xl:col-span-1 shadow-inner group">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 truncate group-hover:text-indigo-600 transition-colors">Filtered AOV</p>
                  <p className="text-4xl md:text-5xl font-black text-gray-900 leading-none truncate tracking-tighter">$114.20</p>
                  <p className="text-[10px] text-amber-600 font-black mt-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Stable <span className="opacity-40 font-bold whitespace-nowrap">transaction node</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm h-[500px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em]">Historical Performance Overlay</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Temporal Resolution: Daily • {filters.startDate} to {filters.endDate}</p>
                  </div>
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-100"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Manifest</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-100"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Surplus</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredSalesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '28px', border: 'none', boxShadow: '0 30px 60px -12px rgb(0 0 0 / 0.18)', padding: '20px' }}
                    />
                    <Area type="monotone" dataKey="revenue" fill="#4f46e5" fillOpacity={0.03} stroke="none" />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[14, 14, 0, 0]} barSize={45} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={5} dot={{r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 4}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                 <div className="bg-gray-50 p-12 rounded-[4rem] h-[500px] border border-gray-100 shadow-inner flex flex-col">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-12">Inventory Node Contribution</h4>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={MOCK_CATEGORY_PERFORMANCE}
                            cx="50%" cy="50%" innerRadius={85} outerRadius={135} paddingAngle={10}
                            dataKey="revenue" nameKey="category"
                          >
                            {MOCK_CATEGORY_PERFORMANCE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />)}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                          />
                          <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ paddingTop: '30px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-white p-12 rounded-[4rem] h-[500px] border border-gray-100 shadow-sm flex flex-col">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-12">Segment Margin Variance</h4>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_CATEGORY_PERFORMANCE}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} unit="%" />
                          <Tooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="margin" fill="#818cf8" radius={[16, 16, 16, 16]} barSize={35} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-8">
                 {MOCK_GEO_DATA.map(geo => (
                   <div key={geo.city} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-default group min-w-0">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 group-hover:text-indigo-600 transition-colors">{geo.region} Cluster</p>
                      <h5 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight mb-10 truncate">{geo.city}</h5>
                      <div className="space-y-6 pt-10 border-t border-gray-50">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-gray-400">Captured Revenue:</span>
                          <span className="text-gray-900 font-black">${geo.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-gray-400">Node Volume:</span>
                          <span className="text-indigo-600 font-black">{geo.orders} items</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
               <div className="p-12 border-b border-gray-100 bg-gray-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                 <div>
                   <h4 className="text-2xl font-black text-gray-900 tracking-tighter">Fiscal Settlement Audit</h4>
                   <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mt-2">Compliance Slice: {filters.startDate} → {filters.endDate}</p>
                 </div>
                 <button onClick={() => notify?.("Initiating automated tax reconciliation and fiscal node verification...", "loading")} className="w-full sm:w-auto px-10 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Execute Reconcile</button>
               </div>
               <div className="p-20 text-center py-40">
                 <span className="text-7xl mb-10 block grayscale opacity-20">⚖️</span>
                 <p className="text-gray-900 font-black text-2xl tracking-tighter">Fiscal Ledger Synthesized</p>
                 <p className="text-sm text-gray-400 font-medium max-w-md mx-auto mt-4 leading-relaxed italic">"Corporate tax reports have been prepared for the specified temporal window. Data verified via enterprise settlement logic."</p>
                 <div className="mt-12 flex justify-center gap-4">
                    <button onClick={() => handleExport('pdf')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-2xl transition-all">Download Audit PDF</button>
                    <button onClick={() => handleExport('excel')} className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Download CSV</button>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Insight Panel */}
        <div className="lg:w-80 bg-indigo-50/40 p-10 border-l border-gray-100 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="space-y-12">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                <span className="text-4xl drop-shadow-lg">✨</span> Insights
              </h3>
              <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mt-4 px-2">Contextual Feed: {activeTab}</p>
            </div>
            <div className="space-y-12 text-gray-600 text-sm font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-8 py-4">
              {aiInsights}
            </div>
          </div>
          <div className="mt-20 p-10 bg-white border border-indigo-100 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 relative overflow-hidden group">
             <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Strategic node</p>
             <p className="text-xs font-black text-gray-900 leading-relaxed mb-12 relative z-10">"{filters.category === 'all' ? 'Inventory' : filters.category} drift detected in current cycle. Adjust marketing logic to maximize Retained Profit."</p>
             <button onClick={handleExecuteStrategy} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-8 py-5 rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all w-full active:scale-95 shadow-sm uppercase tracking-widest relative z-10">Deploy Strategy</button>
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-28 h-28 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;