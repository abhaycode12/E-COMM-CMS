
import React, { useState, useMemo } from 'react';
import { User, UserRole, Role, ModuleType, ActionType, UserPermissionOverride } from '../types';
import AuditLogTable from '../components/AuditLogTable';
import PermissionMatrix from '../components/PermissionMatrix';

interface UsersProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
}

const MOCK_ROLES: Role[] = [
  { id: 'role-sa', name: 'super-admin', display_name: 'Super Administrator', is_active: true, permissions: ['*'], created_at: '2025-01-01' },
  { id: 'role-manager', name: 'manager', display_name: 'Store Manager', is_active: true, permissions: ['products.view', 'products.edit', 'categories.view', 'categories.create', 'categories.edit'], created_at: '2025-01-05' },
  { id: 'role-support', name: 'support', display_name: 'Support Agent', is_active: true, permissions: ['customers.view', 'orders.view', 'orders.approve'], created_at: '2025-01-10' },
  { id: 'role-warehouse', name: 'warehouse', display_name: 'Warehouse Operations', is_active: true, permissions: ['products.view', 'orders.view'], created_at: '2025-01-12' },
];

const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'Abhay', 
    email: 'abhaycode12@gmail.com', 
    role: 'super-admin', 
    roles: ['role-sa'], 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', 
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
    permissions: ['products.view', 'products.edit', 'categories.view', 'categories.create', 'categories.edit', 'orders.view'], 
    overrides: [{ permission_id: 'orders.view', is_allowed: true }],
    last_login: '2025-02-17 04:30 PM' 
  }
];

const ROLE_ID_MAP: Record<UserRole, string> = {
  'super-admin': 'role-sa',
  'admin': 'role-manager',
  'manager': 'role-manager',
  'support': 'role-support',
  'warehouse': 'role-warehouse'
};

const Users: React.FC<UsersProps> = ({ notify }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [showModal, setShowModal] = useState(false);
  const [modalSubTab, setModalSubTab] = useState<'general' | 'roles' | 'overrides'>('general');
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!editingUser) return errs;
    if (!editingUser.name?.trim()) errs.name = "Full legal name is mandatory.";
    if (!editingUser.email?.trim() || !/^\S+@\S+\.\S+$/.test(editingUser.email)) {
      errs.email = "Valid professional email protocol required.";
    }
    if (!editingUser.roles || editingUser.roles.length === 0) {
      errs.roles = "Assign at least one security persona.";
    }
    return errs;
  }, [editingUser]);

  const isUserValid = Object.keys(validationErrors).length === 0;

  const inheritedPermissions = useMemo(() => {
    if (!editingUser?.roles) return [];
    const inherited = editingUser.roles.map(rid => MOCK_ROLES.find(r => r.id === rid)?.permissions || []).flat();
    return [...new Set(inherited)];
  }, [editingUser?.roles]);

  const calculateMergedPermissions = (roles: string[], overrides: UserPermissionOverride[]): string[] => {
    const inherited = roles.map(rid => MOCK_ROLES.find(r => r.id === rid)?.permissions || []).flat();
    if (inherited.includes('*')) return ['*'];

    let merged = [...new Set(inherited)];
    overrides.forEach(o => {
      if (o.is_allowed) {
        if (!merged.includes(o.permission_id)) merged.push(o.permission_id);
      } else {
        merged = merged.filter(p => p !== o.permission_id);
      }
    });
    return merged;
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!editingUser || !isUserValid) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const finalPermissions = calculateMergedPermissions(editingUser.roles || [], editingUser.overrides || []);
      const finalUser = {
        ...editingUser,
        permissions: finalPermissions
      } as User;

      if (editingUser.id) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? finalUser : u));
        notify?.(`Identity manifest for ${finalUser.name} synchronized in global ledger.`, "success");
      } else {
        const newUser: User = {
          ...finalUser,
          id: Math.random().toString(36).substr(2, 9),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalUser.name)}&background=4f46e5&color=fff`,
          last_login: 'Activation Pending'
        };
        setUsers(prev => [newUser, ...prev]);
        notify?.(`Authorization invitation dispatched to ${newUser.email}`, "success");
      }
      setShowModal(false);
      setTouched(false);
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
          // Flip from explicit allow to explicit deny
          currentOverrides[existingIdx] = { ...current, is_allowed: false };
        } else {
          // Remove explicit deny (revert to inherited)
          currentOverrides.splice(existingIdx, 1);
        }
      } else {
        // Add explicit allow
        currentOverrides.push({ permission_id: permId, is_allowed: true });
      }
      return { ...prev, overrides: currentOverrides };
    });
  };

  const handleRoleToggle = (roleId: string) => {
    setEditingUser(prev => {
      if (!prev) return null;
      const currentRoles = [...(prev.roles || [])];
      let updatedRoles: string[];
      
      if (currentRoles.includes(roleId)) {
        updatedRoles = currentRoles.filter(r => r !== roleId);
      } else {
        updatedRoles = [...currentRoles, roleId];
      }

      // Update primary role visual mapping if needed
      let updatedPrimaryRole = prev.role;
      if (updatedRoles.length > 0 && (!prev.role || !updatedRoles.includes(ROLE_ID_MAP[prev.role as UserRole]))) {
        const firstRole = MOCK_ROLES.find(r => r.id === updatedRoles[0]);
        if (firstRole) updatedPrimaryRole = firstRole.name as UserRole;
      }

      return { ...prev, roles: updatedRoles, role: updatedPrimaryRole };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-8">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Personnel Registry</h2>
          <p className="text-gray-500 mt-6 font-medium text-lg max-w-xl">Orchestrate administrative identities, multi-persona assignments, and individual security overrides.</p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex flex-1 lg:flex-none">
            <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all flex-1 lg:flex-none ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>DIRECTORY</button>
            <button onClick={() => setActiveTab('audit')} className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all flex-1 lg:flex-none ${activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}>AUDIT TRAIL</button>
          </div>
          <button onClick={() => { setEditingUser({ roles: [], overrides: [], role: 'support', name: '', email: '' }); setTouched(false); setShowModal(true); setModalSubTab('general'); }} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-95 transition-all">Invite Staff</button>
        </div>
      </header>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-10 py-8">Entity Identity</th>
                  <th className="px-10 py-8">Assigned Personas</th>
                  <th className="px-10 py-8">Policy Divergence</th>
                  <th className="px-10 py-8 text-right">Ops Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                           <img src={user.avatar} className="w-14 h-14 rounded-[1.2rem] object-cover border-4 border-white shadow-lg" alt="" />
                           <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-wrap gap-2 max-w-[250px]">
                        {user.roles.map(rid => {
                          const r = MOCK_ROLES.find(x => x.id === rid);
                          return <span key={rid} className="text-[9px] font-black uppercase bg-white border border-gray-100 text-gray-500 px-3 py-1.5 rounded-lg shadow-sm">{r?.display_name || rid}</span>;
                        })}
                        {user.roles.length === 0 && <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest italic">UNASSIGNED IDENTITY</span>}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${user.overrides.length > 0 ? 'bg-amber-500 animate-pulse shadow-amber-200' : 'bg-green-500 shadow-green-200'} shadow-lg`}></div>
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                          {user.overrides.length > 0 ? `${user.overrides.length} Manual Gates` : 'Inherited Only'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingUser({ ...user }); setTouched(false); setShowModal(true); setModalSubTab('general'); }} className="p-4 bg-white border border-gray-100 text-indigo-600 rounded-2xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90">✏️</button>
                        <button onClick={() => { if(window.confirm('Purge this personnel node?')) setUsers(prev => prev.filter(u => u.id !== user.id)); }} className="p-4 bg-white border border-gray-100 text-red-500 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-90">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AuditLogTable logs={[]} notify={notify} />
      )}

      {showModal && editingUser && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 lg:p-10">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl h-[85vh] shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden">
            <div className="p-12 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                  {editingUser.id ? 'Refine Identity Node' : 'Initialize Staff Protocol'}
                </h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4">Node Registry ID • {editingUser.id || 'NEW_PROTOCOL_INSTANCE'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-16 h-16 flex items-center justify-center bg-white border border-gray-100 rounded-3xl text-gray-400 hover:text-gray-900 shadow-sm hover:shadow-xl transition-all active:scale-90 text-2xl">✕</button>
            </div>

            <nav className="flex border-b border-gray-100 bg-white overflow-x-auto scrollbar-hide flex-shrink-0">
              {[
                { id: 'general', label: 'Core Identity', icon: '👤', hasError: !!validationErrors.name || !!validationErrors.email },
                { id: 'roles', label: 'Persona Cluster', icon: '🛡️', hasError: !!validationErrors.roles },
                { id: 'overrides', label: 'Policy Overrides', icon: '⚡', hasError: false },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalSubTab(tab.id as any)}
                  className={`px-12 py-7 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-8 flex items-center gap-4 relative whitespace-nowrap ${
                    modalSubTab === tab.id ? 'text-indigo-600 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  {tab.label}
                  {tab.hasError && touched && <span className="absolute top-4 right-8 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              {modalSubTab === 'general' && (
                <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Legal Identity</label>
                      <input 
                        type="text" 
                        required
                        value={editingUser.name || ''} 
                        onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                        className={`w-full bg-gray-50 border ${validationErrors.name && touched ? 'border-red-500 ring-8 ring-red-50' : 'border-gray-100 focus:border-indigo-500'} rounded-[1.5rem] px-8 py-5 font-black outline-none transition-all text-gray-900 text-xl shadow-inner`}
                        placeholder="Elena Rodriguez"
                      />
                      {validationErrors.name && touched && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-3">{validationErrors.name}</p>}
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Corporate Dispatch (Email)</label>
                      <input 
                        type="email" 
                        required
                        value={editingUser.email || ''} 
                        onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                        className={`w-full bg-gray-50 border ${validationErrors.email && touched ? 'border-red-500 ring-8 ring-red-50' : 'border-gray-100 focus:border-indigo-500'} rounded-[1.5rem] px-8 py-5 font-black outline-none transition-all text-gray-900 text-xl shadow-inner`}
                        placeholder="e.rod@luminacommerce.io"
                      />
                      {validationErrors.email && touched && <p className="text-red-500 text-[9px] font-black uppercase mt-2 ml-3">{validationErrors.email}</p>}
                    </div>
                  </div>
                </div>
              )}

              {modalSubTab === 'roles' && (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
                  <div className="p-10 bg-indigo-900 text-white rounded-[3rem] flex items-center gap-10 shadow-2xl shadow-indigo-100">
                    <span className="text-5xl drop-shadow-lg">🛡️</span>
                    <div>
                      <h4 className="text-2xl font-black tracking-tight leading-none">Security Persona Architect</h4>
                      <p className="text-indigo-200 text-sm font-medium mt-4 leading-relaxed">Select one or more functional personas. Lumina resolves the final policy matrix by calculating the union of all assigned nodes.</p>
                    </div>
                  </div>
                  
                  {validationErrors.roles && touched && <p className="text-red-500 text-[11px] font-black uppercase text-center py-6 bg-red-50 rounded-[2rem] border border-red-100 shadow-sm">{validationErrors.roles}</p>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_ROLES.map(role => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleToggle(role.id)}
                        className={`p-8 rounded-[2.5rem] border transition-all text-left group flex items-start gap-6 relative overflow-hidden ${
                          editingUser.roles?.includes(role.id) 
                          ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100 -translate-y-1' 
                          : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all ${editingUser.roles?.includes(role.id) ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-gray-200 text-gray-300'}`}>
                           {editingUser.roles?.includes(role.id) ? '✓' : '🔐'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-lg leading-tight tracking-tight mb-1 truncate">{role.display_name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ID: {role.name}</p>
                          <div className="flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${editingUser.roles?.includes(role.id) ? 'bg-indigo-500 animate-pulse' : 'bg-gray-200'}`}></span>
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                               {role.permissions.includes('*') ? 'UNRESTRICTED' : `${role.permissions.length} GATES`}
                             </span>
                          </div>
                        </div>
                        {editingUser.roles?.includes(role.id) && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full -mr-8 -mt-8"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {modalSubTab === 'overrides' && (
                <div className="space-y-12 animate-in fade-in duration-300">
                  <div className="p-10 bg-amber-50 border border-amber-100 rounded-[3rem] flex items-center gap-10 shadow-inner">
                    <span className="text-5xl drop-shadow-sm">⚡</span>
                    <div>
                      <h4 className="text-amber-900 text-2xl font-black tracking-tight leading-none">Individual Policy Drift</h4>
                      <p className="text-amber-700 text-sm font-medium mt-4 leading-relaxed italic">"Hard-coded security exceptions applied at the user level. Use sparingly to maintain clean security architecture."</p>
                    </div>
                  </div>
                  <PermissionMatrix 
                    overrides={editingUser.overrides} 
                    rolesPermissions={inheritedPermissions} 
                    onToggle={toggleOverride}
                  />
                  <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                     <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-indigo-100 rounded-lg"></span>
                        <span>Inherited Flow</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-indigo-600 rounded-lg"></span>
                        <span>Explicit Allow</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-red-500 rounded-lg"></span>
                        <span>Explicit Block</span>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-12 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-6 flex-shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all uppercase text-[10px] tracking-widest">Abort Protocol</button>
              <button 
                onClick={handleSaveUser}
                disabled={isSubmitting || (touched && !isUserValid)}
                className={`
                  px-20 py-5 rounded-[2rem] font-black transition-all active:scale-95 flex items-center justify-center gap-5 uppercase text-[11px] tracking-[0.4em]
                  ${(touched && !isUserValid) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100'}
                `}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  editingUser.id ? 'Synchronize Identity' : 'Authorize Invitation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
