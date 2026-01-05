
import React, { useState } from 'react';
import { User, UserRole, Role, ModuleType, ActionType, UserPermissionOverride } from '../types';
import AuditLogTable from '../components/AuditLogTable';
import PermissionMatrix from '../components/PermissionMatrix';

interface UsersProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MOCK_ROLES: Role[] = [
  { id: 'role-sa', name: 'super-admin', display_name: 'Super Administrator', is_active: true, permissions: ['*'], created_at: '2025-01-01' },
  { id: 'role-manager', name: 'manager', display_name: 'Store Manager', is_active: true, permissions: ['products.view', 'products.edit'], created_at: '2025-01-05' },
  { id: 'role-support', name: 'support', display_name: 'Support Agent', is_active: true, permissions: ['customers.view', 'orders.view'], created_at: '2025-01-10' },
];

const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Alex Rivera', 
    email: 'admin@lumina.com', 
    role: 'super-admin', 
    roles: ['role-sa'], 
    avatar: 'https://i.pravatar.cc/150?u=alex', 
    permissions: ['*'], 
    overrides: [],
    last_login: '2025-02-18 09:15 AM' 
  },
  { 
    id: '2', 
    name: 'Sarah Chen', 
    email: 'sarah.c@lumina.com', 
    role: 'manager', 
    roles: ['role-manager'], 
    avatar: 'https://i.pravatar.cc/150?u=sarah', 
    permissions: ['products.view', 'products.edit'], 
    overrides: [{ permission_id: 'orders.view', is_allowed: true }],
    last_login: '2025-02-17 04:30 PM' 
  }
];

const Users: React.FC<UsersProps> = ({ notify }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [showModal, setShowModal] = useState(false);
  const [modalSubTab, setModalSubTab] = useState<'general' | 'roles' | 'overrides'>('general');
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateUser = (data: Partial<User>): boolean => {
    const newErrors: Record<string, string[]> = {};
    if (!data.name?.trim()) newErrors.name = ["Full name is required"];
    if (!data.email?.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
      newErrors.email = ["A valid corporate email is required"];
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !validateUser(editingUser)) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser.id) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editingUser } as User : u));
        notify?.(`Identity protocol for ${editingUser.name} synchronized.`, "success");
      } else {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: editingUser.name!,
          email: editingUser.email!,
          role: editingUser.role || 'support',
          roles: editingUser.roles || [],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(editingUser.name!)}`,
          permissions: [],
          overrides: editingUser.overrides || [],
          last_login: 'Pending Activation'
        };
        setUsers(prev => [...prev, newUser]);
        notify?.(`Invitation dispatched to ${newUser.email}`, "success");
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOverride = (moduleId: ModuleType, action: ActionType) => {
    const permId = `${moduleId}.${action}`;
    setEditingUser(prev => {
      if (!prev) return null;
      const currentOverrides = [...(prev.overrides || [])];
      const existingIdx = currentOverrides.findIndex(o => o.permission_id === permId);

      if (existingIdx > -1) {
        const current = currentOverrides[existingIdx];
        if (current.is_allowed) {
          currentOverrides[existingIdx] = { ...current, is_allowed: false };
        } else {
          currentOverrides.splice(existingIdx, 1);
        }
      } else {
        currentOverrides.push({ permission_id: permId, is_allowed: true });
      }
      return { ...prev, overrides: currentOverrides };
    });
  };

  const handleRoleToggle = (roleId: string) => {
    setEditingUser(prev => {
      if (!prev) return null;
      const currentRoles = [...(prev.roles || [])];
      if (currentRoles.includes(roleId)) {
        return { ...prev, roles: currentRoles.filter(r => r !== roleId) };
      } else {
        return { ...prev, roles: [...currentRoles, roleId] };
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Access Management</h2>
          <p className="text-gray-500 mt-1">Configure staff identities, multi-role assignments, and explicit permission overrides.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex">
            <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Staff Directory</button>
            <button onClick={() => setActiveTab('audit')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Security Logs</button>
          </div>
          <button onClick={() => { setEditingUser({ roles: [], overrides: [], role: 'support' }); setErrors({}); setShowModal(true); setModalSubTab('general'); }} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100">Invite Staff</button>
        </div>
      </header>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5">Entity</th>
                <th className="px-8 py-5">Assigned Roles</th>
                <th className="px-8 py-5">Security Status</th>
                <th className="px-8 py-5 text-right">Gateways</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={user.avatar} className="w-11 h-11 rounded-xl border border-gray-100" alt="" />
                      <div>
                        <p className="font-black text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-indigo-600 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map(rid => {
                        const r = MOCK_ROLES.find(x => x.id === rid);
                        return <span key={rid} className="text-[9px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">{r?.display_name || rid}</span>;
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.overrides.length > 0 ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                      <span className="text-xs font-bold text-gray-500">{user.overrides.length > 0 ? `${user.overrides.length} Overrides` : 'Default Policy'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingUser(user); setErrors({}); setShowModal(true); setModalSubTab('general'); }} className="p-3 text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100">✏️</button>
                      <button onClick={() => { if(window.confirm('Purge identity?')) setUsers(prev => prev.filter(u => u.id !== user.id)); }} className="p-3 text-red-500 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AuditLogTable logs={[]} />
      )}

      {showModal && editingUser && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingUser.id ? 'Modify User Identity' : 'Initialize Staff Protocol'}</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">RBAC Node: {editingUser.id || 'NEW_NODE'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900">✕</button>
            </div>

            <div className="flex border-b border-gray-100 bg-white">
              {[
                { id: 'general', label: 'General Identity', icon: '👤' },
                { id: 'roles', label: 'Role Assignments', icon: '🛡️' },
                { id: 'overrides', label: 'Permission Overrides', icon: '⚡' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalSubTab(tab.id as any)}
                  className={`px-10 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-3 ${
                    modalSubTab === tab.id ? 'text-indigo-600 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {modalSubTab === 'general' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Legal Name</label>
                      <input 
                        type="text" 
                        required
                        value={editingUser.name || ''} 
                        onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                        className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900`}
                        placeholder="Elena Rodriguez"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Corporate Email</label>
                      <input 
                        type="email" 
                        required
                        value={editingUser.email || ''} 
                        onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                        className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900`}
                        placeholder="name@lumina.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Access Role</label>
                      <select 
                        value={editingUser.role} 
                        onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900"
                      >
                        <option value="support">Customer Support</option>
                        <option value="manager">Operations Manager</option>
                        <option value="admin">Administrator</option>
                        <option value="super-admin">Super Administrator</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {modalSubTab === 'roles' && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
                  <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem]">
                    <h4 className="text-indigo-900 font-black text-lg mb-2">Multi-Role Assignment</h4>
                    <p className="text-indigo-600 text-sm font-medium">Assign multiple system roles to this user. Permissions from all selected roles will be aggregated into their access token.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_ROLES.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleToggle(role.id)}
                        className={`p-6 rounded-[2rem] border transition-all text-left group ${
                          editingUser.roles?.includes(role.id) 
                          ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-100' 
                          : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-indigo-100'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl">🛡️</span>
                          {editingUser.roles?.includes(role.id) && <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>}
                        </div>
                        <p className="font-black text-gray-900">{role.display_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{role.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {modalSubTab === 'overrides' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex items-center gap-6">
                    <span className="text-4xl">⚡</span>
                    <div>
                      <h4 className="text-amber-900 font-black text-lg">Explicit Security Overrides</h4>
                      <p className="text-amber-700 text-sm font-medium">These settings will override any permissions inherited from roles. Use sparingly for exceptional access needs.</p>
                    </div>
                  </div>
                  <PermissionMatrix 
                    overrides={editingUser.overrides} 
                    rolesPermissions={editingUser.roles?.map(rid => MOCK_ROLES.find(r => r.id === rid)?.permissions || []).flat()} 
                    onToggle={toggleOverride}
                  />
                </div>
              )}
            </div>

            <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 font-black text-gray-400 hover:text-gray-900 transition-all">Discard</button>
              <button 
                onClick={handleSaveUser}
                disabled={isSubmitting}
                className="px-16 py-4 bg-indigo-600 text-white rounded-3xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-95 transition-all flex items-center gap-3"
              >
                {isSubmitting ? <span className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></span> : null}
                {editingUser.id ? 'Synchronize Identity' : 'Execute Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
