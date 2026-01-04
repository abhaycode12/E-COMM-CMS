
import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';

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
      { id: 'oi-1', product_id: 'p-1', variant_id: 'v-1', name: 'Premium Leather Boots', sku: 'BT-001-BR-10', quantity: 1, shipped_quantity: 0, returned_quantity: 0, price: 129.99, tax_amount: 15.60, total: 145.59 }
    ],
    shipments: [],
    shipping_address: { id: 'a1', type: 'shipping', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' },
    billing_address: { id: 'a2', type: 'billing', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' },
    timeline: [
      { status: OrderStatus.PENDING, timestamp: '2025-02-15 10:30 AM', note: 'Order placed by customer' },
      { status: OrderStatus.PROCESSING, timestamp: '2025-02-15 11:00 AM', note: 'Inventory verified' }
    ]
  },
  {
    id: '2',
    order_number: 'ORD-2025-002',
    customer_id: 'cust-2',
    customer_name: 'Marcus Thorne',
    customer_email: 'mthorne@techcorp.io',
    date: '2025-02-14 04:15 PM',
    status: OrderStatus.SHIPPED,
    payment_status: PaymentStatus.PAID,
    subtotal: 49.00,
    tax: 2.45,
    shipping_cost: 5.00,
    discount: 5.00,
    total: 51.45,
    items: [
      { id: 'oi-2', product_id: 'p-2', variant_id: 'v-3', name: 'Cotton Crewneck Tee', sku: 'TS-042-W-L', quantity: 2, shipped_quantity: 2, returned_quantity: 0, price: 24.50, tax_amount: 1.22, total: 25.72 }
    ],
    shipments: [
      // Fix: Added missing courier_id and updates property to Shipment object to match the interface definition
      { 
        id: 's1', 
        shipment_number: 'SHP-001', 
        courier_id: 'c1', 
        courier_name: 'FedEx', 
        tracking_number: '1234567890', 
        status: 'in_transit', 
        shipped_at: '2025-02-15 09:00 AM', 
        items: [{ order_item_id: 'oi-2', quantity: 2 }],
        updates: []
      }
    ],
    shipping_address: { id: 'a3', type: 'shipping', is_default: true, full_name: 'Marcus Thorne', phone: '555-9876', address_line1: '456 Innovation Way', city: 'San Jose', state: 'CA', zip_code: '95134', country: 'USA' },
    billing_address: { id: 'a3', type: 'billing', is_default: true, full_name: 'Marcus Thorne', phone: '555-9876', address_line1: '456 Innovation Way', city: 'San Jose', state: 'CA', zip_code: '95134', country: 'USA' },
    timeline: [
      { status: OrderStatus.PENDING, timestamp: '2025-02-14 04:15 PM' },
      { status: OrderStatus.PROCESSING, timestamp: '2025-02-14 04:30 PM' },
      { status: OrderStatus.SHIPPED, timestamp: '2025-02-15 09:00 AM', note: 'Shipped via FedEx' }
    ]
  }
];

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-700';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      case OrderStatus.RETURNED: return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order Fulfillment</h2>
          <p className="text-gray-500 mt-1">Manage lifecycle, partial shipments, and returns.</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="all">All Stages</option>
            <option value={OrderStatus.PENDING}>New Orders</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>In Transit</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
          </select>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            📥 Export Orders
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">Order ID</th>
              <th className="px-8 py-5">Customer</th>
              <th className="px-8 py-5">Value</th>
              <th className="px-8 py-5">Stage</th>
              <th className="px-8 py-5">Payment</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="font-mono font-bold text-gray-900">{order.order_number}</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{order.date}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="font-black text-gray-800 text-sm">{order.customer_name}</span>
                    <span className="text-xs text-gray-400">{order.customer_email}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="font-black text-gray-900">${order.total.toFixed(2)}</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{order.items.length} Items</p>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[10px] font-black uppercase ${order.payment_status === PaymentStatus.PAID ? 'text-green-600' : 'text-red-500'}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-sm group-hover:border-indigo-200"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{selectedOrder.order_number}</h3>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-gray-400 font-medium mt-1">Order placed on {selectedOrder.date}</p>
              </div>
              <div className="flex gap-3">
                <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all" title="Print Invoice">🖨️</button>
                <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all" title="Shipping Label">🏷️</button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-3 gap-10">
              {/* Order Items & Fulfillment */}
              <div className="col-span-2 space-y-10">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Line Items</h4>
                  <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase">
                        <tr>
                          <th className="px-6 py-4">Product Details</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Qty</th>
                          <th className="px-6 py-4">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedOrder.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-6 py-5">
                              <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-1">{item.sku}</p>
                            </td>
                            <td className="px-6 py-5 font-bold text-gray-600">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-5">
                              <span className="font-black text-indigo-600">×{item.quantity}</span>
                              {item.shipped_quantity > 0 && <p className="text-[9px] text-green-500 font-black uppercase mt-1">{item.shipped_quantity} Shipped</p>}
                            </td>
                            <td className="px-6 py-5 font-black text-gray-900">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Shipments Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Package Fulfillment</h4>
                    {selectedOrder.status === OrderStatus.PROCESSING && (
                      <button className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all">
                        + Create Partial Shipment
                      </button>
                    )}
                  </div>
                  {selectedOrder.shipments.length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrder.shipments.map(s => (
                        <div key={s.id} className="bg-indigo-50/30 border border-indigo-100 rounded-[2rem] p-6 flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                            <span className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">📦</span>
                            <div>
                              <p className="font-black text-indigo-900">{s.shipment_number} • {s.courier_name}</p>
                              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Tracking: <span className="font-mono text-indigo-600">{s.tracking_number}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] px-2 py-1 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest">{s.status.replace('_', ' ')}</span>
                            <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1">Shipped {s.shipped_at}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 border-2 border-dashed border-gray-100 rounded-[3rem] text-center">
                      <p className="text-gray-400 text-sm font-medium italic">No shipments initialized for this order yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Metadata & Timeline */}
              <div className="space-y-10">
                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Info</h5>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-lg">👤</div>
                      <div>
                        <p className="font-black text-gray-900 text-sm leading-tight">{selectedOrder.customer_name}</p>
                        <p className="text-xs text-indigo-600 font-bold">{selectedOrder.customer_email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 text-gray-500">Shipping to</p>
                      <p className="text-xs font-bold text-gray-800">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1 text-gray-500">Total Paid</p>
                      <p className="text-xs font-bold text-green-600">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Order Journey</h5>
                  <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {selectedOrder.timeline.map((event, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === selectedOrder.timeline.length - 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></span>
                        <div>
                          <p className="text-xs font-black text-gray-900 leading-tight uppercase tracking-wider">{event.status}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{event.timestamp}</p>
                          {event.note && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">{event.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex gap-4">
                {selectedOrder.status === OrderStatus.PENDING && (
                  <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Confirm Order</button>
                )}
                {selectedOrder.status === OrderStatus.PROCESSING && (
                  <button className="px-8 py-3 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 shadow-xl shadow-green-100 transition-all">Move to Shipping</button>
                )}
              </div>
              <div className="flex gap-4">
                <button className="px-8 py-3 rounded-2xl font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">Cancel Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
