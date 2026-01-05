
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';

interface OrdersProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
  removeNotify?: (id: string) => void;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    order_number: 'ORD-2025-001',
    customer_id: 'cust-1',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah.j@example.com',
    date: '2025-02-15 10:30 AM',
    status: OrderStatus.PROCESSING,
    payment_status: PaymentStatus.PAID,
    subtotal: 129.99,
    tax: 15.60,
    shipping_cost: 10.00,
    discount: 0,
    total: 155.59,
    items: [],
    shipments: [],
    shipping_address: { id: 'a1', type: 'shipping', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' },
    billing_address: { id: 'a2', type: 'billing', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' },
    timeline: []
  }
];

const Orders: React.FC<OrdersProps> = ({ notify, removeNotify }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleExport = (format: 'pdf' | 'csv') => {
    setShowExportMenu(false);
    const loadingId = notify?.(`Compiling fiscal manifest...`, 'loading');
    setTimeout(() => {
      if (loadingId && removeNotify) removeNotify(loadingId);
      notify?.(`Ledger export complete. Local buffer cleared.`, "success");
    }, 1200);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-visible">
        <div className="relative z-10 space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Order Ledger</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">Orchestrate fulfillment & monitor fiscal health.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto relative z-[20]">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-14 px-8 bg-gray-50 text-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-200 flex items-center justify-center gap-3 w-full sm:w-auto active:scale-95"
            >
              <span className="text-lg">📊</span> Export Batch
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-[50] min-w-[200px] animate-in zoom-in-95 slide-in-from-top-2">
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all">📄 Full Ledger PDF</button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">📝 Semantic CSV</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Advanced Filter Suite */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="relative lg:col-span-2">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search #Manifest or Client Identity..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none cursor-pointer"
        >
          <option value="all">All Lifecycles</option>
          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <select 
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none cursor-pointer"
        >
          <option value="all">All Payments</option>
          {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.25em] font-black border-b border-gray-100">
              <tr>
                <th className="px-12 py-10">Manifest ID</th>
                <th className="px-12 py-10">Client Entity</th>
                <th className="px-12 py-10">Gross Value</th>
                <th className="px-12 py-10">Lifecycle</th>
                <th className="px-12 py-10">Fiscal Status</th>
                <th className="px-12 py-10 text-right">Ops Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-indigo-50/20 transition-all duration-300 group cursor-pointer">
                  <td className="px-12 py-10">
                    <span className="font-mono font-black text-gray-900 text-xl tracking-tighter leading-none">{order.order_number}</span>
                    <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-widest">{order.date}</p>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-800 text-lg tracking-tight leading-tight">{order.customer_name}</span>
                      <span className="text-[10px] text-indigo-600 font-bold uppercase mt-1 tracking-widest">{order.customer_email}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className="font-black text-gray-900 text-2xl tracking-tighter">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${order.payment_status === PaymentStatus.PAID ? 'text-green-600' : 'text-red-500'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <button className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-2xl transition-all group-hover:scale-110">👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
