import React, { useState, useMemo, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line, Area
} from 'recharts';
import { SalesAnalyticsItem, CategorySalesPerformance, GeographicPerformance } from '../types';
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
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState({
    startDate: '2025-02-10',
    endDate: '2025-02-16',
    segment: 'all',
    region: 'all'
  });

  useEffect(() => {
    handleRefreshInsights();
  }, [activeTab]);

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
    const loadId = notify?.(`Compiling ${format.toUpperCase()} business report for period ${filters.startDate} to ${filters.endDate}...`, 'loading');
    
    setTimeout(() => {
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.(`Analysis Export Successful. ${format.toUpperCase()} file dispatched for local download.`, 'success');
      setIsExporting(null);
    }, 2500);
  };

  const handleExecuteStrategy = () => {
    const loadId = notify?.("Committing strategic marketing adjustments to backend engine...", "loading");
    setTimeout(() => {
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.("Strategy executed. Budget allocation optimized for current demand drift.", "success");
    }, 2000);
  };

  const filteredSalesData = useMemo(() => {
    // Simulated filtering logic
    return MOCK_SALES_TIME_SERIES.filter(item => 
      item.date >= filters.startDate && item.date <= filters.endDate
    );
  }, [filters.startDate, filters.endDate]);

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
            PDF
          </button>
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('excel')} 
            className="flex-1 lg:flex-none px-8 py-4 bg-white text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 flex items-center justify-center gap-3 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isExporting === 'excel' ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span> : <span>📊</span>}
            Excel
          </button>
          <button 
            disabled={!!isExporting}
            onClick={() => handleExport('csv')} 
            className="flex-1 lg:flex-none px-8 py-4 bg-white text-gray-700 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 flex items-center justify-center gap-3 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {isExporting === 'csv' ? <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></span> : <span>📁</span>}
            CSV
          </button>
        </div>
      </header>

      {/* Filter Ribbon */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal Range</label>
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="bg-transparent text-xs font-black text-gray-700 outline-none cursor-pointer"
            />
            <span className="text-gray-300">→</span>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="bg-transparent text-xs font-black text-gray-700 outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Market Segment</label>
          <select 
            value={filters.segment}
            onChange={(e) => setFilters({...filters, segment: e.target.value})}
            className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-black text-gray-700 outline-none cursor-pointer hover:bg-white transition-all shadow-sm min-w-[160px]"
          >
            <option value="all">All Channels</option>
            <option value="direct">Direct Storefront</option>
            <option value="marketplace">Partner Marketplace</option>
            <option value="mobile">Native Mobile App</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Regional Node</label>
          <select 
            value={filters.region}
            onChange={(e) => setFilters({...filters, region: e.target.value})}
            className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-xs font-black text-gray-700 outline-none cursor-pointer hover:bg-white transition-all shadow-sm min-w-[160px]"
          >
            <option value="all">Global Reach</option>
            <option value="north">North America</option>
            <option value="emea">EMEA Territory</option>
            <option value="apac">APAC Cluster</option>
          </select>
        </div>

        <div className="flex-1 flex justify-end items-end h-full">
           <button 
             onClick={() => {
               setFilters({
                 startDate: '2025-02-10',
                 endDate: '2025-02-16',
                 segment: 'all',
                 region: 'all'
               });
               notify?.("Analytical workspace filters reset to default parameters.", "info");
             }}
             className="text-[10px] font-black text-indigo-600 hover:underline px-4 py-3"
           >
             Reset Filters
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Side Menu */}
        <div className="lg:w-72 border-r border-gray-100 bg-gray-50/20 p-6 space-y-2 flex-shrink-0">
          {[
            { id: 'sales', label: 'Gross Revenue', icon: '📈' },
            { id: 'categories', label: 'Category Alpha', icon: '🏷️' },
            { id: 'geo', label: 'Regional Demand', icon: '🌍' },
            { id: 'financials', label: 'Tax & Compliance', icon: '⚖️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div className="mt-10 p-8 bg-indigo-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-60">Lumina AI Core</h5>
            <p className="text-xs font-bold leading-relaxed mb-8 group-hover:text-indigo-200 transition-colors">Gemini is synthesizing filtered workspace metrics...</p>
            <button 
              onClick={handleRefreshInsights}
              disabled={isGenerating}
              className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-900 rounded-full animate-spin"></div> : 'Refresh Intel'}
            </button>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Chart Zone */}
        <div className="flex-1 p-6 md:p-10 lg:p-12 min-h-[600px] min-w-0">
          {activeTab === 'sales' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-colors cursor-default min-w-0 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 truncate">Filtered Volume</p>
                  <p className="text-3xl md:text-4xl font-black text-gray-900 leading-none truncate">${totalVolume.toLocaleString()}</p>
                  <p className="text-[9px] text-green-600 font-black mt-4 flex items-center gap-1">↑ 12.4% <span className="opacity-40 font-bold whitespace-nowrap">vs prev period</span></p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-colors cursor-default min-w-0 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 truncate">Profit Net</p>
                  <p className="text-3xl md:text-4xl font-black text-gray-900 leading-none truncate">${(totalVolume * 0.3).toLocaleString()}</p>
                  <p className="text-[9px] text-indigo-600 font-black mt-4 flex items-center gap-1">↑ 8.2% <span className="opacity-40 font-bold whitespace-nowrap">optimized margin</span></p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:bg-white transition-colors cursor-default min-w-0 sm:col-span-2 xl:col-span-1 shadow-inner">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 truncate">AOV Cycle</p>
                  <p className="text-3xl md:text-4xl font-black text-gray-900 leading-none truncate">$112</p>
                  <p className="text-[9px] text-amber-600 font-black mt-4 flex items-center gap-1">Stable <span className="opacity-40 font-bold whitespace-nowrap">growth node</span></p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm h-[450px]">
                <div className="flex justify-between items-center mb-10">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Revenue/Profit Overlay</h4>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase">Gross Volume</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-[9px] font-black text-gray-400 uppercase">Net Profit</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredSalesData}>
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
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                 <div className="bg-gray-50 p-10 rounded-[3.5rem] h-[450px] border border-gray-100 shadow-inner flex flex-col">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Category Share Index</h4>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={MOCK_CATEGORY_PERFORMANCE}
                            cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8}
                            dataKey="revenue" nameKey="category"
                          >
                            {MOCK_CATEGORY_PERFORMANCE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 <div className="bg-white p-10 rounded-[3.5rem] h-[450px] border border-gray-100 shadow-sm flex flex-col">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">Profitability Margin Cluster</h4>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_CATEGORY_PERFORMANCE}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'black'}} unit="%" />
                          <Tooltip 
                             contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="margin" fill="#818cf8" radius={[12, 12, 12, 12]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-8">
                 {MOCK_GEO_DATA.map(geo => (
                   <div key={geo.city} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-default group min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-indigo-600 transition-colors">{geo.region} Domain</p>
                      <h5 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight mb-8 truncate">{geo.city}</h5>
                      <div className="space-y-4 pt-8 border-t border-gray-50">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-400">Captured Revenue:</span>
                          <span className="text-gray-900">${geo.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-400">Order Volume:</span>
                          <span className="text-indigo-600 font-black">{geo.orders} units</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
                 <div>
                   <h4 className="text-xl font-black text-gray-900 tracking-tight">Compliance & Settlement Audit</h4>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Snapshot: {filters.startDate} → {filters.endDate}</p>
                 </div>
                 <button onClick={() => notify?.("Initiating automated tax reconciliation...", "loading")} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Reconcile Hub</button>
               </div>
               <div className="p-10 text-center py-32">
                 <span className="text-6xl mb-6 block grayscale opacity-30">⚖️</span>
                 <p className="text-gray-900 font-black text-xl">Fiscal Ledger Prepared</p>
                 <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mt-2 leading-relaxed">Tax report generated for the filtered period. Use the Excel/PDF export nodes at the top of the workspace to retrieve the data.</p>
               </div>
            </div>
          )}
        </div>

        {/* Insight Panel */}
        <div className="lg:w-80 bg-indigo-50/30 p-10 border-l border-gray-100 flex flex-col justify-between overflow-y-auto flex-shrink-0">
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                <span className="text-3xl">✨</span> Insights Ledger
              </h3>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-3 px-1">Contextual Feed: {activeTab}</p>
            </div>
            <div className="space-y-10 text-gray-600 text-sm font-medium leading-relaxed italic border-l-4 border-indigo-200 pl-6 py-2">
              {aiInsights}
            </div>
          </div>
          <div className="mt-16 p-10 bg-white border border-indigo-100 rounded-[3rem] shadow-2xl shadow-indigo-100/50 relative overflow-hidden group">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-1">Strategic recommendation</p>
             <p className="text-xs font-black text-gray-900 leading-relaxed mb-10 relative z-10">"Category drift detected in {filters.region} territory. Shift 15% marketing budget to performance Apparel for the upcoming cycle."</p>
             <button onClick={handleExecuteStrategy} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-8 py-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all w-full active:scale-95 shadow-sm uppercase tracking-widest relative z-10">Execute Strategy</button>
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;