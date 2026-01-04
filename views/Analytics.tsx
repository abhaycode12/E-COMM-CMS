
import React, { useState, useMemo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { SalesAnalyticsItem, CategorySalesPerformance, GeographicPerformance, TaxReportLine } from '../types';
import { analyzeSalesTrends } from '../services/geminiService';

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
  { category: 'Home & Kitchen', revenue: 12000, units: 450, margin: 35 },
];

const MOCK_GEO_DATA: GeographicPerformance[] = [
  { region: 'North', city: 'Chicago', orders: 145, revenue: 15600 },
  { region: 'West', city: 'Los Angeles', orders: 230, revenue: 28900 },
  { region: 'East', city: 'New York', orders: 198, revenue: 24500 },
  { region: 'South', city: 'Houston', orders: 112, revenue: 12400 },
];

const MOCK_TAX_DATA: TaxReportLine[] = [
  { hsn: '6403', taxable_value: 125000, gst_rate: 12, igst: 8000, cgst: 3500, sgst: 3500, total_tax: 15000 },
  { hsn: '6109', taxable_value: 85000, gst_rate: 5, igst: 2250, cgst: 1000, sgst: 1000, total_tax: 4250 },
  { hsn: '8517', taxable_value: 450000, gst_rate: 18, igst: 41000, cgst: 20000, sgst: 20000, total_tax: 81000 },
];

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#6366f1'];

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'categories' | 'geo' | 'financials'>('sales');
  const [aiInsights, setAiInsights] = useState<string>('Crunching datasets for strategic insights...');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    handleRefreshInsights();
  }, [activeTab]);

  const handleRefreshInsights = async () => {
    setIsGenerating(true);
    const dataForAI = activeTab === 'sales' ? MOCK_SALES_TIME_SERIES : 
                     activeTab === 'categories' ? MOCK_CATEGORY_PERFORMANCE :
                     activeTab === 'geo' ? MOCK_GEO_DATA : MOCK_TAX_DATA;
                     
    const insights = await analyzeSalesTrends({ tab: activeTab, metrics: dataForAI });
    setAiInsights(insights || 'No automated insights for this segment.');
    setIsGenerating(false);
  };

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    alert(`Initializing ${format.toUpperCase()} generation job... You will be notified when the report is ready for download.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Business Intelligence</h2>
          <p className="text-gray-500 mt-1">Holistic analysis across sales, operations, and compliance.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={() => handleExport('pdf')} className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <span>📄</span> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <span>📊</span> Excel
          </button>
          <button onClick={() => handleExport('csv')} className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <span>📝</span> CSV
          </button>
        </div>
      </header>

      {/* Navigation Matrix */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-64 border-r border-gray-100 bg-gray-50/30 p-4 space-y-1">
          {[
            { id: 'sales', label: 'Revenue & Volume', icon: '📈' },
            { id: 'categories', label: 'Product & Margin', icon: '🏷️' },
            { id: 'geo', label: 'Regional Trends', icon: '🌍' },
            { id: 'financials', label: 'Tax & Compliance', icon: '⚖️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">AI Advisor</h5>
            <p className="text-[11px] text-indigo-400 font-medium leading-relaxed">Gemini is actively monitoring your performance metrics.</p>
            <button 
              onClick={handleRefreshInsights}
              disabled={isGenerating}
              className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGenerating ? 'Refreshing...' : 'Re-Analyze Dataset'}
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 min-h-[700px]">
          {/* Tab Content: Sales Performance */}
          {activeTab === 'sales' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aggregate Revenue</p>
                  <p className="text-4xl font-black text-gray-900">$1,420,500</p>
                  <p className="text-xs text-green-600 font-bold mt-2">↑ 12.4% vs last period</p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mean Order Value</p>
                  <p className="text-4xl font-black text-gray-900">$112.40</p>
                  <p className="text-xs text-indigo-600 font-bold mt-2">Consistent across channels</p>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gross Net Margin</p>
                  <p className="text-4xl font-black text-gray-900">32.8%</p>
                  <p className="text-xs text-amber-600 font-bold mt-2">Optimization recommended</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[450px]">
                <h4 className="text-lg font-black text-gray-900 mb-8">Revenue & Profit Trajectory</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={MOCK_SALES_TIME_SERIES}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      cursor={{stroke: '#4f46e5', strokeWidth: 2}}
                    />
                    <Area type="monotone" dataKey="revenue" fill="#4f46e5" fillOpacity={0.05} stroke="none" />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab Content: Category Performance */}
          {activeTab === 'categories' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[400px]">
                  <h4 className="text-lg font-black text-gray-900 mb-8">Category Revenue Distribution</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_CATEGORY_PERFORMANCE}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="revenue"
                        nameKey="category"
                      >
                        {MOCK_CATEGORY_PERFORMANCE.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[400px]">
                  <h4 className="text-lg font-black text-gray-900 mb-8">Margin vs Volume Analysis</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CATEGORY_PERFORMANCE}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip />
                      <Bar dataKey="margin" name="Margin %" fill="#818cf8" radius={[8, 8, 8, 8]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                     <tr>
                       <th className="px-8 py-5">Category Name</th>
                       <th className="px-8 py-5">Total Revenue</th>
                       <th className="px-8 py-5">Volume Sold</th>
                       <th className="px-8 py-5">Operating Margin</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {MOCK_CATEGORY_PERFORMANCE.map(cat => (
                       <tr key={cat.category} className="hover:bg-gray-50/50">
                         <td className="px-8 py-5 font-black text-gray-900">{cat.category}</td>
                         <td className="px-8 py-5 font-bold text-gray-700">${cat.revenue.toLocaleString()}</td>
                         <td className="px-8 py-5 text-gray-500 font-medium">{cat.units.toLocaleString()} units</td>
                         <td className="px-8 py-5">
                            <span className={`text-xs font-black px-3 py-1 rounded-full ${cat.margin > 30 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {cat.margin}%
                            </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* Tab Content: Geographic Performance */}
          {activeTab === 'geo' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {MOCK_GEO_DATA.map(geo => (
                   <div key={geo.city} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{geo.region} Division</p>
                     <h5 className="text-xl font-black text-gray-900 mb-3">{geo.city}</h5>
                     <div className="space-y-2 pt-3 border-t border-gray-200/50">
                       <div className="flex justify-between text-xs">
                         <span className="text-gray-400">Revenue:</span>
                         <span className="text-gray-900 font-black">${geo.revenue.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                         <span className="text-gray-400">Demand:</span>
                         <span className="text-indigo-600 font-black">{geo.orders} orders</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[400px]">
                 <h4 className="text-lg font-black text-gray-900 mb-8">Market Penetration by City</h4>
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={MOCK_GEO_DATA} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="city" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} width={100} />
                     <Tooltip />
                     <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 10, 10, 0]} barSize={25} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* Tab Content: Financial & Tax */}
          {activeTab === 'financials' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center gap-8">
                <span className="text-5xl">📝</span>
                <div>
                  <h4 className="text-2xl font-black text-amber-900 leading-tight">GST/VAT Settlement Summary</h4>
                  <p className="text-amber-700 font-medium text-sm mt-1">HSN-level tax breakdown for the current financial cycle. Reconciled with gateway settlements.</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                    <tr>
                      <th className="px-8 py-5">HSN Code</th>
                      <th className="px-8 py-5">Taxable Value</th>
                      <th className="px-8 py-5">GST Rate</th>
                      <th className="px-8 py-5">IGST (Inter-state)</th>
                      <th className="px-8 py-5">CGST + SGST</th>
                      <th className="px-8 py-5 text-right">Total Tax Liability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_TAX_DATA.map(tax => (
                      <tr key={tax.hsn} className="hover:bg-gray-50/50">
                        <td className="px-8 py-5 font-black text-indigo-600">{tax.hsn}</td>
                        <td className="px-8 py-5 font-bold text-gray-900">${tax.taxable_value.toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded">{tax.gst_rate}%</span>
                        </td>
                        <td className="px-8 py-5 text-gray-500 font-medium">${tax.igst.toLocaleString()}</td>
                        <td className="px-8 py-5 text-gray-500 font-medium">${tax.cgst + tax.sgst}</td>
                        <td className="px-8 py-5 text-right font-black text-gray-900">${tax.total_tax.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-indigo-900 text-white">
                    <tr>
                      <td className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Consolidated Totals</td>
                      <td className="px-8 py-6 font-black text-lg">${MOCK_TAX_DATA.reduce((acc, t) => acc + t.taxable_value, 0).toLocaleString()}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="px-8 py-6 text-right font-black text-lg">${MOCK_TAX_DATA.reduce((acc, t) => acc + t.total_tax, 0).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Insight Drawer (Side/Floating for wide, Stacked for small) */}
        <div className="w-full bg-indigo-900 p-8 text-white relative overflow-hidden flex flex-col justify-between border-t md:border-t-0 md:w-80">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <span className="text-2xl">✨</span> Gemini AI Insights
            </h3>
            <div className="space-y-6 text-indigo-100 text-sm leading-relaxed whitespace-pre-line">
              {aiInsights}
            </div>
          </div>
          <div className="mt-12 relative z-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
             <h5 className="text-[10px] font-black uppercase tracking-widest mb-2 text-indigo-300">Action Plan</h5>
             <p className="text-xs text-indigo-100 font-medium italic leading-relaxed">"Based on recent {activeTab} trends, we suggest adjusting seasonal stock in the {MOCK_GEO_DATA[0].city} hub to improve last-mile efficiency."</p>
          </div>
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full opacity-10 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-[100px]"></div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
