
import React, { useState, useMemo } from 'react';
import { Courier, Shipment, LogisticsReport } from '../types';

// Add missing props interface
interface ShippingProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MOCK_COURIERS: Courier[] = [
  { id: 'c1', name: 'FedEx Express', code: 'fedex', is_active: true, tracking_url_template: 'https://fedex.com/track/{{tracking_number}}' },
  { id: 'c2', name: 'UPS Global', code: 'ups', is_active: true, tracking_url_template: 'https://ups.com/track/{{tracking_number}}' },
  { id: 'c3', name: 'DHL Priority', code: 'dhl', is_active: false, tracking_url_template: 'https://dhl.com/track/{{tracking_number}}' },
];

const MOCK_SHIPMENTS: Shipment[] = [
  { 
    id: 's1', 
    shipment_number: 'SHP-101', 
    courier_id: 'c1', 
    courier_name: 'FedEx Express', 
    tracking_number: '7845129033', 
    status: 'in_transit', 
    shipped_at: '2025-02-15 09:00 AM', 
    items: [],
    updates: [
      { id: 'u1', shipment_id: 's1', status: 'Picked Up', location: 'Portland, OR', timestamp: '2025-02-15 09:00 AM' },
      { id: 'u2', shipment_id: 's1', status: 'In Transit', location: 'Seattle, WA', timestamp: '2025-02-15 04:30 PM' }
    ]
  },
  { 
    id: 's2', 
    shipment_number: 'SHP-102', 
    courier_id: 'c2', 
    courier_name: 'UPS Global', 
    tracking_number: '1Z999AA10123', 
    status: 'delivered', 
    shipped_at: '2025-02-14 10:00 AM', 
    delivered_at: '2025-02-16 02:15 PM',
    items: [],
    updates: []
  },
  { 
    id: 's3', 
    shipment_number: 'SHP-103', 
    courier_id: 'c1', 
    courier_name: 'FedEx Express', 
    tracking_number: '7845129044', 
    status: 'failed_attempt', 
    shipped_at: '2025-02-16 08:00 AM', 
    items: [],
    updates: [
       { id: 'u3', shipment_id: 's3', status: 'Delivery Failed', note: 'Customer not available', timestamp: '2025-02-17 11:00 AM' }
    ]
  }
];

const MOCK_REPORTS: LogisticsReport[] = [
  { id: 'r1', courier_id: 'c1', courier_name: 'FedEx Express', total_shipments: 450, avg_delivery_days: 2.4, success_rate: 98.2, failed_delivery_count: 8 },
  { id: 'r2', courier_id: 'c2', courier_name: 'UPS Global', total_shipments: 320, avg_delivery_days: 3.1, success_rate: 95.5, failed_delivery_count: 14 },
];

// Fix: Accept notify prop from parent
const Shipping: React.FC<ShippingProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'couriers' | 'performance'>('shipments');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const stats = useMemo(() => {
    const totalActive = MOCK_SHIPMENTS.filter(s => s.status === 'in_transit').length;
    const totalFailed = MOCK_SHIPMENTS.filter(s => s.status === 'failed_attempt').length;
    const avgSuccess = MOCK_REPORTS.reduce((acc, r) => acc + r.success_rate, 0) / MOCK_REPORTS.length;
    return { totalActive, totalFailed, avgSuccess };
  }, []);

  const filteredShipments = MOCK_SHIPMENTS.filter(s => 
    s.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCarrierOnboard = () => {
    notify?.('Carrier partner onboarded and API keys verified.', 'success');
    setShowCourierModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Logistics Hub</h2>
          <p className="text-gray-500 mt-1">Real-time tracking, courier management, and delivery performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <span>📡</span> Track All
          </button>
          <button 
            onClick={() => setShowCourierModal(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
          >
            <span>➕</span> Add Carrier
          </button>
        </div>
      </header>

      {/* Logistics Overview Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">In Transit</p>
          <p className="text-3xl font-black text-indigo-600">{stats.totalActive} Parcels</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">Moving across global hubs</p>
        </div>
        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm">
          <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2 text-red-700">Action Required</p>
          <p className="text-3xl font-black text-red-900">{stats.totalFailed} Failed Attempts</p>
          <p className="text-[10px] text-red-600 font-bold uppercase mt-2 animate-pulse">Needs Customer Outreach</p>
        </div>
        <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100">
          <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Network Efficiency</p>
          <p className="text-3xl font-black">{stats.avgSuccess.toFixed(1)}% Success</p>
          <p className="text-[10px] text-indigo-300 font-bold uppercase mt-2">Average across all carriers</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 px-6 overflow-x-auto scrollbar-hide">
          {[
            { id: 'shipments', label: 'Live Shipments', icon: '📦' },
            { id: 'couriers', label: 'Carrier Partners', icon: '🚚' },
            { id: 'performance', label: 'Efficiency Analytics', icon: '📈' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-5 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === 'shipments' && (
            <div className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search Tracking ID or Shipment #..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-900"
                  />
                </div>
                <select className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-900 outline-none">
                  <option>All Carriers</option>
                  {MOCK_COURIERS.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5">Manifest #</th>
                      <th className="px-8 py-5">Courier</th>
                      <th className="px-8 py-5">Tracking Info</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Last Scan</th>
                      <th className="px-8 py-5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredShipments.map(s => (
                      <tr key={s.id} className="hover:bg-indigo-50/20 transition-colors group">
                        <td className="px-8 py-5 font-black text-gray-900">{s.shipment_number}</td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase">{s.courier_name}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-mono font-bold text-gray-500">{s.tracking_number}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-black">Link copied to clipboard</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                            s.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            s.status === 'in_transit' ? 'bg-indigo-100 text-indigo-700' :
                            s.status === 'failed_attempt' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {s.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-gray-700">{s.updates[s.updates.length - 1]?.location || 'N/A'}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{s.updates[s.updates.length - 1]?.timestamp || s.shipped_at}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setSelectedShipment(s)}
                            className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'couriers' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_COURIERS.map(c => (
                <div key={c.id} className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] relative group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100">
                      {c.code === 'fedex' ? '🚚' : c.code === 'ups' ? '✈️' : '🚛'}
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {c.is_active ? 'Active Connection' : 'Offline'}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2">{c.name}</h4>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">{c.code} API Integration</p>
                  
                  <div className="space-y-4 pt-6 border-t border-gray-100/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Auto-Webhook:</span>
                      <span className="text-green-600 font-bold uppercase">Enabled</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Tracking Template:</span>
                      <span className="text-gray-900 font-mono font-bold truncate max-w-[120px]">URL Loaded</span>
                    </div>
                  </div>

                  <button className="w-full mt-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95">
                    Configure API Keys
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {MOCK_REPORTS.map(r => (
                  <div key={r.id} className="bg-gray-50 border border-gray-100 p-10 rounded-[3rem] space-y-8">
                    <div className="flex justify-between items-center">
                      <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{r.courier_name}</h4>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">Network Report</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white rounded-[2rem] border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Success</p>
                        <p className="text-3xl font-black text-gray-900">{r.success_rate}%</p>
                        <div className="mt-3 w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{width: `${r.success_rate}%`}}></div>
                        </div>
                      </div>
                      <div className="p-6 bg-white rounded-[2rem] border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Avg Speed</p>
                        <p className="text-3xl font-black text-gray-900">{r.avg_delivery_days} Days</p>
                        <p className="text-[9px] text-indigo-400 font-bold uppercase mt-2">Warehouse to Door</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-red-50 rounded-[2rem] border border-red-100/50">
                       <div>
                         <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Total Failures</p>
                         <p className="text-2xl font-black text-red-900">{r.failed_delivery_count} Parcels</p>
                       </div>
                       <button className="bg-white text-red-600 px-6 py-3 rounded-2xl font-black text-xs shadow-sm hover:shadow-md transition-all">
                         View Audit
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Detail Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Tracking Ledger: {selectedShipment.shipment_number}</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedShipment.courier_name} • <span className="font-mono">{selectedShipment.tracking_number}</span></p>
              </div>
              <button onClick={() => setSelectedShipment(null)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all">✕</button>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${selectedShipment.status === 'delivered' ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                  <p className="text-xl font-black text-gray-900 uppercase tracking-widest">{selectedShipment.status.replace('_', ' ')}</p>
                </div>
                <button className="text-xs font-black text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl hover:bg-indigo-100">
                  Open Carrier Portal ↗
                </button>
              </div>

              <div className="relative pl-10 space-y-10 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {selectedShipment.updates.length > 0 ? selectedShipment.updates.map((update, idx) => (
                  <div key={update.id} className="relative">
                    <span className={`absolute -left-10 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? 'bg-indigo-600' : 'bg-gray-200'}`}></span>
                    <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                      <p className="text-sm font-black text-gray-900 mb-1">{update.status}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{update.timestamp}</p>
                      {update.location && <p className="text-xs text-indigo-600 font-bold">📍 {update.location}</p>}
                      {update.note && <p className="text-xs text-gray-500 mt-2 italic">"{update.note}"</p>}
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-10 border-2 border-dashed border-gray-100 rounded-[2rem]">
                    <p className="text-gray-400 font-medium italic">Shipment created. Waiting for carrier handoff.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-10 py-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
               <button className="px-8 py-3 rounded-2xl font-black text-red-600 hover:bg-red-50">Mark as Lost</button>
               <button className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700">Send Update to Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* Courier Config Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 p-10 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Onboard Courier Partner</h3>
                <p className="text-gray-400 text-sm mt-1">Initialize API connection with global logistics networks.</p>
              </div>

              <div className="space-y-6">
                 <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Courier Name</label>
                   <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black outline-none text-gray-900" placeholder="e.g. FedEx International" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Internal Code</label>
                     <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono font-bold outline-none text-gray-900" placeholder="fedex_intl" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Region Scope</label>
                     <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none appearance-none">
                        <option>Global</option>
                        <option>North America</option>
                        <option>Europe</option>
                        <option>Asia-Pacific</option>
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Tracking URL Pattern</label>
                   <input type="text" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono text-xs outline-none text-gray-900" placeholder="https://track.com/?id={{tracking_number}}" />
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowCourierModal(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCarrierOnboard}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
                >
                  Authorize Partner
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
