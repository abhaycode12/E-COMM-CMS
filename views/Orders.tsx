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
    items: [
      { id: 'oi1', product_id: '1', variant_id: 'v1', name: 'Premium Leather Boots', sku: 'BT-001-BR-10', quantity: 1, shipped_quantity: 1, returned_quantity: 0, price: 129.99, tax_amount: 15.60, total: 145.59 }
    ],
    shipments: [],
    shipping_address: { id: 'a1', type: 'shipping', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' },
    billing_address: { id: 'a2', type: 'billing', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' },
    timeline: [
      { status: OrderStatus.PENDING, timestamp: '2025-02-15 10:30 AM', note: 'Order placed by customer' },
      { status: OrderStatus.PROCESSING, timestamp: '2025-02-15 11:00 AM', note: 'Payment verified via Stripe' }
    ]
  },
  {
    id: '2',
    order_number: 'ORD-2025-002',
    customer_id: 'cust-2',
    customer_name: 'Marcus Thorne',
    customer_email: 'marcus@tech.com',
    date: '2025-02-16 11:20 AM',
    status: OrderStatus.PENDING,
    payment_status: PaymentStatus.UNPAID,
    subtotal: 45.00,
    tax: 4.50,
    shipping_cost: 5.00,
    discount: 0,
    total: 54.50,
    items: [],
    shipments: [],
    shipping_address: { id: 'a3', type: 'shipping', is_default: true, full_name: 'Marcus Thorne', phone: '555-9876', address_line1: '456 Tech Blvd', city: 'San Jose', state: 'CA', zip_code: '95112', country: 'USA' },
    billing_address: { id: 'a4', type: 'billing', is_default: true, full_name: 'Marcus Thorne', phone: '555-9876', address_line1: '456 Tech Blvd', city: 'San Jose', state: 'CA', zip_code: '95112', country: 'USA' },
    timeline: []
  }
];

const Orders: React.FC<OrdersProps> = ({ notify, removeNotify }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) setSelectedIds([]);
    else setSelectedIds(filteredOrders.map(o => o.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatusChange = (newStatus: OrderStatus) => {
    const loadId = notify?.(`Advancing ${selectedIds.length} orders to ${newStatus}...`, 'loading');
    setTimeout(() => {
      setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status: newStatus } : o));
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.(`Lifecycle update complete. Manifests updated.`, 'success');
      setSelectedIds([]);
    }, 1500);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-700';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-visible">
        <div className="relative z-10 space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Order Ledger</h2>
          <p className="text-gray-500 font-medium text-lg leading-relaxed">Orchestrate fulfillment & monitor fiscal health.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => notify?.("Compiling comprehensive orders CSV for external ERP sync...", "loading")}
             className="px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
           >
             Export CSV
           </button>
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="h-14 bg-gray-50 border border-gray-200 rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none cursor-pointer hover:bg-white transition-all"
           >
             <option value="all">All Status</option>
             {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
           </select>
        </div>
      </header>

      {/* Bulk Fulfillment Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-6 z-[60] bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between animate-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-8 px-4">
            <span className="text-sm font-black uppercase tracking-widest text-indigo-400">{selectedIds.length} Orders Selected</span>
            <div className="flex gap-3">
              <button onClick={() => handleBulkStatusChange(OrderStatus.PROCESSING)} className="px-6 py-2.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Mark Processing</button>
              <button onClick={() => handleBulkStatusChange(OrderStatus.SHIPPED)} className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Mark Shipped</button>
              <button onClick={() => handleBulkStatusChange(OrderStatus.DELIVERED)} className="px-6 py-2.5 bg-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all">Mark Delivered</button>
            </div>
          </div>
          <button onClick={() => setSelectedIds([])} className="text-gray-400 hover:text-white px-4 text-xs font-black uppercase tracking-widest">Clear Selection</button>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
        <div className="p-8 border-b border-gray-100 bg-gray-50/20">
          <input 
            type="text" 
            placeholder="Search #Manifest or Client Identity..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
          />
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.25em] font-black border-b border-gray-100">
              <tr>
                <th className="px-12 py-10">
                  <input type="checkbox" checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0} onChange={toggleSelectAll} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-12 py-10">Manifest ID</th>
                <th className="px-12 py-10">Client Entity</th>
                <th className="px-12 py-10">Gross Value</th>
                <th className="px-12 py-10">Lifecycle</th>
                <th className="px-12 py-10 text-right">Ops Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <tr key={order.id} onClick={() => setInspectingOrder(order)} className={`hover:bg-indigo-50/10 transition-all duration-300 group cursor-pointer ${selectedIds.includes(order.id) ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-12 py-10" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
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
                  <td className="px-12 py-10 text-xl font-black text-gray-900 tracking-tighter">${order.total.toFixed(2)}</td>
                  <td className="px-12 py-10">
                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setInspectingOrder(order)} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-2xl transition-all group-hover:scale-110 active:scale-95">👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-shrink-0">
               <div>
                  <div className="flex items-center gap-4">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{inspectingOrder.order_number}</h3>
                    <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-sm ${getStatusColor(inspectingOrder.status)}`}>
                      {inspectingOrder.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-2">Manifest Identity Pool • {inspectingOrder.date}</p>
               </div>
               <button onClick={() => setInspectingOrder(null)} className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all text-xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Distribution</h4>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Full Name</p>
                        <p className="text-xl font-black text-gray-900">{inspectingOrder.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Electronic Mail</p>
                        <p className="text-lg font-bold text-indigo-600">{inspectingOrder.customer_email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Node</h4>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
                       <div>
                         <p className="text-xs text-gray-400 font-bold uppercase mb-1">Payment Status</p>
                         <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${inspectingOrder.payment_status === PaymentStatus.PAID ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {inspectingOrder.payment_status}
                         </span>
                       </div>
                       <div>
                         <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Manifest Value</p>
                         <p className="text-3xl font-black text-gray-900">${inspectingOrder.total.toFixed(2)}</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Line Item Audit</h4>
                 <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
                       <tr>
                         <th className="px-8 py-5">Product Entity</th>
                         <th className="px-8 py-5">SKU Node</th>
                         <th className="px-8 py-5">Unit Count</th>
                         <th className="px-8 py-5 text-right">Aggregate</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {inspectingOrder.items.length > 0 ? inspectingOrder.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-8 py-5 font-black text-gray-900">{item.name}</td>
                            <td className="px-8 py-5 font-mono text-xs font-bold text-gray-500">{item.sku}</td>
                            <td className="px-8 py-5 font-bold text-gray-700">{item.quantity} units</td>
                            <td className="px-8 py-5 text-right font-black text-gray-900">${item.total.toFixed(2)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-8 py-10 text-center text-gray-400 italic">No line items attached to manifest node.</td>
                          </tr>
                        )}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>

            <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 flex-shrink-0">
               <button onClick={() => notify?.("Generating print-ready PDF invoice for " + inspectingOrder.order_number, "loading")} className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm">Print Invoice</button>
               <button onClick={() => setInspectingOrder(null)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100">Dismiss Ledger</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;