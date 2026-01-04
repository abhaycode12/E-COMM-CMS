
import React, { useState, useMemo } from 'react';
import { InventoryLog, Warehouse, ProductVariant } from '../types';

const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', name: 'Main Fulfillment Center', code: 'MAIN-01', location: 'Chicago, IL', is_active: true },
  { id: 'w2', name: 'West Coast Hub', code: 'WEST-02', location: 'Los Angeles, CA', is_active: true }
];

const MOCK_INVENTORY_ITEMS = [
  { id: 'inv1', sku: 'BT-001-BR-10', product_name: 'Premium Leather Boots', attributes: { color: 'Brown', size: '10' }, warehouse: 'MAIN-01', stock: 15, reserved: 2, threshold: 10 },
  { id: 'inv2', sku: 'BT-001-BK-10', product_name: 'Premium Leather Boots', attributes: { color: 'Black', size: '10' }, warehouse: 'MAIN-01', stock: 5, reserved: 0, threshold: 10 },
  { id: 'inv3', sku: 'TS-042-W-L', product_name: 'Cotton Crewneck Tee', attributes: { color: 'White', size: 'L' }, warehouse: 'WEST-02', stock: 120, reserved: 15, threshold: 20 },
  { id: 'inv4', sku: 'TS-042-BK-M', product_name: 'Cotton Crewneck Tee', attributes: { color: 'Black', size: 'M' }, warehouse: 'MAIN-01', stock: 0, reserved: 0, threshold: 5 }
];

const MOCK_LOGS: InventoryLog[] = [
  { id: 'l1', sku: 'BT-001-BR-10', product_name: 'Premium Leather Boots', change: 20, previous_stock: 0, new_stock: 20, reason: 'restock', user_name: 'Alex Rivera', created_at: '2025-02-10 09:00 AM', warehouse_name: 'MAIN-01' },
  { id: 'l2', sku: 'BT-001-BR-10', product_name: 'Premium Leather Boots', change: -5, previous_stock: 20, new_stock: 15, reason: 'sale', user_name: 'System', created_at: '2025-02-12 02:30 PM', warehouse_name: 'MAIN-01' },
  { id: 'l3', sku: 'TS-042-BK-M', product_name: 'Cotton Crewneck Tee', change: -5, previous_stock: 5, new_stock: 0, reason: 'damage', user_name: 'John Doe', created_at: '2025-02-14 11:15 AM', warehouse_name: 'MAIN-01' }
];

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'levels' | 'logs' | 'warehouses'>('levels');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentTarget, setAdjustmentTarget] = useState<any>(null);

  const filteredInventory = useMemo(() => {
    return MOCK_INVENTORY_ITEMS.filter(item => {
      const matchesSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
      return matchesSearch && matchesWarehouse;
    });
  }, [searchTerm, selectedWarehouse]);

  const stockSummary = useMemo(() => {
    const lowStock = MOCK_INVENTORY_ITEMS.filter(i => i.stock > 0 && i.stock <= i.threshold).length;
    const outOfStock = MOCK_INVENTORY_ITEMS.filter(i => i.stock === 0).length;
    const totalValuation = 45200; 
    return { lowStock, outOfStock, totalValuation };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Intelligence</h2>
          <p className="text-gray-500 mt-1">Global stock management across {MOCK_WAREHOUSES.length} fulfillment hubs.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <span>📥</span> Import Manifest
          </button>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 active:scale-95">
            <span>🔄</span> Full Stocktake
          </button>
        </div>
      </header>

      {/* Analytics Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">⚠️</div>
          <div>
            <p className="text-amber-900 font-black text-2xl leading-none">{stockSummary.lowStock}</p>
            <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mt-1">Low Stock Alerts</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🚫</div>
          <div>
            <p className="text-red-900 font-black text-2xl leading-none">{stockSummary.outOfStock}</p>
            <p className="text-red-700 text-xs font-bold uppercase tracking-wider mt-1">Out of Stock Items</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💹</div>
          <div>
            <p className="text-green-900 font-black text-2xl leading-none">${stockSummary.totalValuation.toLocaleString()}</p>
            <p className="text-green-700 text-xs font-bold uppercase tracking-wider mt-1">Total Stock Value</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-gray-100">
          {[
            { id: 'levels', label: 'Stock Levels', icon: '📊' },
            { id: 'logs', label: 'Movement Logs', icon: '📜' },
            { id: 'warehouses', label: 'Warehouse Config', icon: '🏢' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-10 py-5 text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab.id 
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50/30' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'levels' && (
            <div className="space-y-6">
              <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search by SKU or Product Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900"
                  />
                </div>
                <select 
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="all">All Warehouses</option>
                  {MOCK_WAREHOUSES.map(w => <option key={w.id} value={w.code}>{w.name}</option>)}
                </select>
              </div>

              <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5">Inventory Target</th>
                      <th className="px-8 py-5">Hub</th>
                      <th className="px-8 py-5">Availability</th>
                      <th className="px-8 py-5">Pipeline</th>
                      <th className="px-8 py-5 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-gray-900 leading-tight">{item.product_name}</span>
                            <span className="text-xs font-mono text-gray-400 mt-1">{item.sku}</span>
                            <div className="flex gap-1 mt-2">
                              {Object.values(item.attributes).map((v, i) => (
                                <span key={i} className="text-[8px] font-black px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 uppercase">{v}</span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">{item.warehouse}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1.5">
                            <span className={`text-lg font-black ${
                              item.stock === 0 ? 'text-red-500' : 
                              item.stock <= item.threshold ? 'text-amber-500' : 
                              'text-indigo-600'
                            }`}>
                              {item.stock} Units
                            </span>
                            {item.stock <= item.threshold && item.stock > 0 && (
                              <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Below Threshold ({item.threshold})</span>
                            )}
                            {item.stock === 0 && (
                              <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Critically Depleted</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-500">{item.reserved} Reserved</span>
                            <p className="text-[10px] text-gray-400 font-medium">Allocated for active orders</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => { setAdjustmentTarget(item); setShowAdjustmentModal(true); }}
                            className="bg-white border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
               <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5">Movement Details</th>
                      <th className="px-8 py-5">Warehouse</th>
                      <th className="px-8 py-5">Change</th>
                      <th className="px-8 py-5">New Balance</th>
                      <th className="px-8 py-5">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {MOCK_LOGS.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                              log.reason === 'sale' ? 'bg-red-50 text-red-600' : 
                              log.reason === 'restock' ? 'bg-green-50 text-green-600' : 
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {log.reason === 'sale' ? '🛒' : log.reason === 'restock' ? '📥' : '🔧'}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight">{log.product_name}</p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">{log.created_at}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-500">{log.warehouse_name}</td>
                        <td className="px-8 py-5">
                          <span className={`text-sm font-black ${log.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {log.change > 0 ? '+' : ''}{log.change}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-black text-gray-900">{log.new_stock}</td>
                        <td className="px-8 py-5 text-sm font-bold text-gray-500">{log.user_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'warehouses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_WAREHOUSES.map(w => (
                <div key={w.id} className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] relative group hover:border-indigo-100 hover:bg-white transition-all">
                  <span className="absolute top-8 right-8 text-xs font-black px-3 py-1 bg-green-100 text-green-700 rounded-full uppercase tracking-widest">Active</span>
                  <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm mb-6 border border-gray-100">🏢</div>
                  <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2">{w.name}</h4>
                  <p className="text-sm font-bold text-indigo-600 mb-6 uppercase tracking-wider">{w.code}</p>
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">Physical Location:</span>
                      <span className="text-gray-900 font-bold">{w.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">Assigned Staff:</span>
                      <span className="text-gray-900 font-bold">12 Employees</span>
                    </div>
                  </div>
                  <button className="w-full mt-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100">
                    Manage Hub Settings
                  </button>
                </div>
              ))}
              <div className="border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 group hover:border-indigo-100 hover:bg-indigo-50/20 transition-all cursor-pointer">
                <span className="text-4xl grayscale group-hover:grayscale-0 transition-transform group-hover:scale-110">🏗️</span>
                <p className="text-lg font-black text-gray-400 mt-4 group-hover:text-indigo-600">Register New Hub</p>
                <p className="text-xs text-gray-300 font-medium mt-1">Expansion planning & location mapping.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustmentModal && adjustmentTarget && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manual Stock Override</h3>
                <p className="text-gray-400 text-sm mt-1">Adjusting: {adjustmentTarget.product_name} ({adjustmentTarget.sku})</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1 text-gray-500">Live Inventory</p>
                  <p className="text-2xl font-black text-gray-900">{adjustmentTarget.stock}</p>
                </div>
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Fulfillment Hub</p>
                  <p className="text-xl font-black text-indigo-600">{adjustmentTarget.warehouse}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Adjustment Quantity (+/-)</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 50 or -5"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xl font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Reason for Deviation</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none appearance-none">
                    <option value="restock">📥 New Stock Inbound</option>
                    <option value="adjustment">🔧 Manual Error Correction</option>
                    <option value="damage">💥 Damaged / Unsellable</option>
                    <option value="return">🔙 Customer Return Restock</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowAdjustmentModal(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Execute Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
