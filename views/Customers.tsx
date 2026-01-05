
import React, { useState } from 'react';
import { Customer, Address, CustomerNote } from '../types';

// Add missing props interface
interface CustomersProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 012-3456',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    is_blocked: false,
    total_orders: 12,
    lifetime_value: 1450.50,
    is_repeat_customer: true,
    joined_at: '2023-05-12',
    last_order_at: '2025-02-10',
    addresses: [
      { id: 'addr-1', type: 'shipping', is_default: true, full_name: 'Sarah Jenkins', phone: '555-0123', address_line1: '123 Maple St', city: 'Portland', state: 'OR', zip_code: '97201', country: 'USA' }
    ],
    notes: [
      { id: 'note-1', admin_id: 'admin-1', admin_name: 'Alex Rivera', note: 'Prefers eco-friendly packaging.', created_at: '2024-11-20' }
    ]
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    email: 'mthorne@techcorp.io',
    phone: '+1 (555) 987-6543',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    is_blocked: true,
    total_orders: 1,
    lifetime_value: 89.00,
    is_repeat_customer: false,
    joined_at: '2025-01-05',
    last_order_at: '2025-01-06',
    addresses: [],
    notes: [
      { id: 'note-2', admin_id: 'admin-1', admin_name: 'Alex Rivera', note: 'Fraudulent activity detected in first order.', created_at: '2025-01-07' }
    ]
  }
];

// Fix: Accept notify prop from parent
const Customers: React.FC<CustomersProps> = ({ notify }) => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBlock = (id: string) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, is_blocked: !c.is_blocked } : c
    ));
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(prev => prev ? { ...prev, is_blocked: !prev.is_blocked } : null);
    }
    notify?.(`Customer ${id} status updated.`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">CRM & Customer Insights</h2>
          <p className="text-gray-500 mt-1">Manage relationships and monitor lifetime value.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium min-w-[300px] text-gray-900"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0 z-10 text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Customer Entity</th>
                  <th className="px-8 py-5">Value (LTV)</th>
                  <th className="px-8 py-5">Loyalty</th>
                  <th className="px-8 py-5 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className={`cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={customer.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                        <div>
                          <p className="font-black text-gray-900 text-sm leading-tight">{customer.name}</p>
                          <p className="text-xs text-gray-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">${customer.lifetime_value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{customer.total_orders} Orders</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {customer.is_repeat_customer ? (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-tighter">Repeat Customer</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-tighter">New Entry</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`w-3 h-3 rounded-full inline-block ${customer.is_blocked ? 'bg-red-500 shadow-sm shadow-red-200' : 'bg-green-500 shadow-sm shadow-green-200'}`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Detail Sidebar */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {selectedCustomer ? (
            <div className="p-8 space-y-8 overflow-y-auto">
              <div className="text-center space-y-4">
                <img src={selectedCustomer.avatar} className="w-24 h-24 rounded-3xl mx-auto border-4 border-indigo-50 shadow-xl" alt="" />
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedCustomer.name}</h3>
                  <p className="text-gray-400 text-sm font-medium">Joined {new Date(selectedCustomer.joined_at).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => toggleBlock(selectedCustomer.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                      selectedCustomer.is_blocked 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {selectedCustomer.is_blocked ? '🔓 Unblock' : '🚫 Block Access'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Lifetime Value</p>
                  <p className="text-lg font-black text-gray-900">${selectedCustomer.lifetime_value}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Orders</p>
                  <p className="text-lg font-black text-gray-900">{selectedCustomer.total_orders}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Primary Address</h4>
                {selectedCustomer.addresses.length > 0 ? (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm space-y-1">
                    <p className="font-black text-gray-800">{selectedCustomer.addresses[0].address_line1}</p>
                    <p className="text-gray-500 font-medium text-gray-500">{selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} {selectedCustomer.addresses[0].zip_code}</p>
                    <p className="text-gray-500 font-medium text-gray-500">{selectedCustomer.addresses[0].country}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic text-gray-500">No addresses saved.</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Internal Support Notes</h4>
                  <button className="text-[10px] font-black text-indigo-600">+ Add</button>
                </div>
                <div className="space-y-3">
                  {selectedCustomer.notes.map(note => (
                    <div key={note.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100 relative">
                      <p className="text-xs text-amber-900 font-medium mb-2 leading-relaxed italic">"{note.note}"</p>
                      <div className="flex justify-between items-center border-t border-amber-100/50 pt-2">
                        <span className="text-[8px] font-black text-amber-700 uppercase">{note.admin_name}</span>
                        <span className="text-[8px] font-bold text-amber-500 uppercase">{note.created_at}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-4">
              <span className="text-6xl grayscale">👤</span>
              <div>
                <p className="font-black text-gray-600">No Customer Selected</p>
                <p className="text-sm font-medium">Select a profile from the list to view deep insights and manage account status.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
