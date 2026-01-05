
import React, { useState, useMemo } from 'react';
import { Payment, Refund, Settlement, PaymentMethodType } from '../types';

// Add missing props interface
interface PaymentsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', order_id: '1', order_number: 'ORD-2025-001', transaction_id: 'ch_3Nabc123', method: 'stripe', amount: 155.59, currency: 'USD', status: 'completed', captured_at: '2025-02-15 10:35 AM', created_at: '2025-02-15 10:30 AM' },
  { id: 'pay2', order_id: '2', order_number: 'ORD-2025-002', transaction_id: 'txn_987654', method: 'paypal', amount: 51.45, currency: 'USD', status: 'completed', captured_at: '2025-02-14 04:20 PM', created_at: '2025-02-14 04:15 PM' },
  { id: 'pay3', order_id: '3', order_number: 'ORD-2025-003', method: 'cod', amount: 84.20, currency: 'USD', status: 'pending', created_at: '2025-02-16 09:12 AM' },
  { id: 'pay4', order_id: '4', order_number: 'ORD-2025-004', transaction_id: 'ch_3Nxyz789', method: 'stripe', amount: 299.00, currency: 'USD', status: 'refunded', captured_at: '2025-02-10 11:00 AM', created_at: '2025-02-10 10:45 AM' },
];

const MOCK_SETTLEMENTS: Settlement[] = [
  { id: 'set1', period_start: '2025-02-01', period_end: '2025-02-07', total_gross: 12450.00, total_refunds: 450.00, net_amount: 12000.00, status: 'settled' },
  { id: 'set2', period_start: '2025-02-08', period_end: '2025-02-14', total_gross: 8900.50, total_refunds: 120.00, net_amount: 8780.50, status: 'pending' },
];

// Fix: Accept notify prop from parent
const Payments: React.FC<PaymentsProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements'>('transactions');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => {
    const totalCollected = MOCK_PAYMENTS.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
    const totalPending = MOCK_PAYMENTS.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
    const refundRate = (MOCK_PAYMENTS.filter(p => p.status === 'refunded').length / MOCK_PAYMENTS.length) * 100;
    return { totalCollected, totalPending, refundRate };
  }, []);

  const filteredPayments = MOCK_PAYMENTS.filter(p => 
    p.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodIcon = (method: PaymentMethodType) => {
    switch(method) {
      case 'stripe': return '💳';
      case 'paypal': return '🅿️';
      case 'cod': return '💵';
      case 'bank_transfer': return '🏦';
      default: return '💰';
    }
  };

  const handleRefund = () => {
    notify?.(`Refund initiated for transaction ${selectedPayment?.transaction_id}`, 'success');
    setShowRefundModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financial Treasury</h2>
          <p className="text-gray-500 mt-1">Transaction monitoring, gateway management, and settlements.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <span>📅</span> Export Ledger
          </button>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100">
            <span>📊</span> Reconciliation
          </button>
        </div>
      </header>

      {/* Financial Health Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2">Total Gross Volume</p>
            <p className="text-4xl font-black">${stats.totalCollected.toLocaleString()}</p>
          </div>
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-10">💰</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Pending Clearances (COD)</p>
          <p className="text-3xl font-black text-gray-900">${stats.totalPending.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">Requires Fulfillment Verification</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Revenue Retention</p>
          <p className="text-3xl font-black text-gray-900">{(100 - stats.refundRate).toFixed(1)}%</p>
          <div className="mt-4 w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{width: `${100 - stats.refundRate}%`}}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* View Selection */}
        <div className="flex border-b border-gray-100 px-6">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-5 text-sm font-black transition-all border-b-2 ${activeTab === 'transactions' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            Gateways & Transactions
          </button>
          <button 
            onClick={() => setActiveTab('settlements')}
            className={`px-6 py-5 text-sm font-black transition-all border-b-2 ${activeTab === 'settlements' ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            Settlement Reports
          </button>
        </div>

        {activeTab === 'transactions' ? (
          <div className="p-8 space-y-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Transaction Hash..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900"
                />
              </div>
              <select className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-900 outline-none">
                <option>All Gateways</option>
                <option>Stripe</option>
                <option>PayPal</option>
                <option>Cash on Delivery</option>
              </select>
            </div>

            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-5">Origin Order</th>
                    <th className="px-8 py-5">Method</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Gateway ID</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 leading-tight">{p.order_number}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.created_at}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">{getMethodIcon(p.method)}</span>
                          <span className="text-xs font-black text-gray-500 uppercase">{p.method}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-gray-900">${p.amount.toFixed(2)}</span>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{p.currency}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{p.transaction_id || 'N/A'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          p.status === 'refunded' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {p.status === 'completed' && (
                          <button 
                            onClick={() => { setSelectedPayment(p); setShowRefundModal(true); }}
                            className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            Refund Flow
                          </button>
                        )}
                        <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors ml-2">👁️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {MOCK_SETTLEMENTS.map(s => (
                <div key={s.id} className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] relative group hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs text-indigo-600 font-black uppercase tracking-widest mb-1">Batch ID: {s.id}</p>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight">{s.period_start} to {s.period_end}</h4>
                    </div>
                    <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${s.status === 'settled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100/50 mb-6">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Gross</p>
                      <p className="text-lg font-black text-gray-900">${s.total_gross.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 text-red-400">Refunds</p>
                      <p className="text-lg font-black text-red-500">-${s.total_refunds.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Net Flow</p>
                      <p className="text-lg font-black text-indigo-600">${s.net_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2">
                    📥 Download Comprehensive Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 space-y-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Initiate Refund Flow</h3>
                <p className="text-gray-400 text-sm mt-1">Order {selectedPayment.order_number} • {selectedPayment.transaction_id}</p>
              </div>

              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Refundable Balance</p>
                  <p className="text-3xl font-black text-indigo-600">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl">{getMethodIcon(selectedPayment.method)}</span>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1">{selectedPayment.method} Gateway</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Refund Amount</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">$</span>
                    <input 
                      type="number" 
                      defaultValue={selectedPayment.amount}
                      max={selectedPayment.amount}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-5 text-2xl font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Reason for Refund</label>
                  <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none appearance-none">
                    <option>Customer Request (Changed Mind)</option>
                    <option>Inventory Discrepancy (Out of Stock)</option>
                    <option>Duplicate Transaction</option>
                    <option>Product Defect / Damage</option>
                    <option>Other / Fraud Suspicion</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all"
                >
                  Discard Flow
                </button>
                <button 
                  onClick={handleRefund}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95"
                >
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
