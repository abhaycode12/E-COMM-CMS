import React, { useState } from 'react';
import { User, UserRole } from '../types';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Alex Rivera', email: 'admin@lumina.com', role: 'super-admin', avatar: 'https://i.pravatar.cc/150?u=alex', permissions: ['*'], last_login: '2025-02-18 09:15 AM' },
  { id: '2', name: 'Jordan Smith', email: 'jsmith@lumina.com', role: 'manager', avatar: 'https://i.pravatar.cc/150?u=jordan', permissions: ['products.*', 'orders.view'], last_login: '2025-02-17 04:30 PM' },
  { id: '3', name: 'Riley Vance', email: 'rvance@lumina.com', role: 'support', avatar: 'https://i.pravatar.cc/150?u=riley', permissions: ['customers.view', 'orders.view'], last_login: '2025-02-18 10:00 AM' },
  { id: '4', name: 'Taylor Bay', email: 'tbay@lumina.com', role: 'warehouse', avatar: 'https://i.pravatar.cc/150?u=taylor', permissions: ['inventory.*', 'shipping.*'], last_login: '2025-02-16 08:20 AM' },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super-admin': return 'bg-indigo-900 text-white';
      case 'admin': return 'bg-indigo-100 text-indigo-700';
      case 'manager': return 'bg-amber-100 text-amber-700';
      case 'support': return 'bg-green-100 text-green-700';
      case 'warehouse': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Access Control</h2>
          <p className="text-gray-500 mt-1">Manage administrative users, roles, and granular permissions.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
        >
          <span>👤+</span> Invite Team Member
        </button>
      </header>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">Team Member</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Assigned Permissions</th>
              <th className="px-8 py-5">Last Active</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover border border-gray-100" alt="" />
                    <div>
                      <p className="font-black text-gray-900 text-sm leading-tight">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
                    {user.role.replace('-', ' ')}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {user.permissions.map(p => (
                      <span key={p} className="text-[8px] font-black px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-gray-400">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-bold text-gray-700">{user.last_login || 'Never'}</p>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="text-gray-300 hover:text-indigo-600 p-2 transition-colors">⚙️</button>
                   <button className="text-gray-300 hover:text-red-600 p-2 transition-colors">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 p-10 space-y-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Invite Team Member</h3>
              <p className="text-gray-400 text-sm mt-1">Send an invitation to join your LuminaCommerce instance.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900" 
                  placeholder="john@example.com" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assign Role</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none appearance-none cursor-pointer text-gray-900">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="support">Customer Support</option>
                  <option value="warehouse">Warehouse Specialist</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
               <button onClick={() => setShowInviteModal(false)} className="flex-1 py-4 text-gray-400 font-black hover:text-gray-900">Cancel</button>
               <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg">Send Invitation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;