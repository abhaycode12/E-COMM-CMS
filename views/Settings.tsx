import React, { useState } from 'react';
import { SystemSettings, Role, ModuleType, ActionType } from '../types';
import PermissionMatrix from '../components/PermissionMatrix';

interface SettingsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const MOCK_ROLES: Role[] = [
  { id: 'role-sa', name: 'super-admin', display_name: 'Super Administrator', is_active: true, permissions: ['*'], created_at: '2025-01-01' },
  { id: 'role-manager', name: 'manager', display_name: 'Store Manager', is_active: true, permissions: ['products.view', 'products.create', 'products.edit', 'orders.view', 'orders.approve'], created_at: '2025-01-05' },
  { id: 'role-support', name: 'support', display_name: 'Support Agent', is_active: true, permissions: ['customers.view', 'orders.view'], created_at: '2025-01-10' },
];

const ACTIONS: ActionType[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

const Settings: React.FC<SettingsProps> = ({ notify }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    store_name: 'Lumina Premium Store',
    store_email: 'hello@luminastore.com',
    currency: 'USD',
    timezone: 'UTC',
    maintenance_mode: false,
    api_keys: {
      stripe_publishable: 'pk_test_********************',
      stripe_secret: 'sk_test_********************',
      google_maps: 'AIzaSy**********************'
    }
  });

  // Fix: Renamed activeGroup to activeTab to resolve 'Cannot find name' errors in JSX
  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'payments' | 'integration'>('general');
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateRole = (data: Partial<Role>): boolean => {
    const newErrors: Record<string, string[]> = {};
    if (!data.display_name?.trim()) newErrors.display_name = ["Role title is required"];
    if (!data.name?.trim()) newErrors.name = ["System identifier key is required"];
    if (!data.permissions || data.permissions.length === 0) {
      newErrors.permissions = ["Grant at least one permission node to this role identity"];
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTogglePermission = (moduleId: ModuleType, action: ActionType) => {
    const permId = `${moduleId}.${action}`;
    setEditingRole(prev => {
      if (!prev) return null;
      const current = prev.permissions || [];
      const updated = current.includes(permId) 
        ? current.filter(p => p !== permId) 
        : [...current, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleToggleModule = (moduleId: ModuleType, currentPerms: string[]) => {
    const allModulePermIds = ACTIONS.map(a => `${moduleId}.${a}`);
    const hasAll = allModulePermIds.every(id => (editingRole?.permissions || []).includes(id));

    setEditingRole(prev => {
      if (!prev) return null;
      const basePerms = prev.permissions || [];
      const filtered = basePerms.filter(p => !p.startsWith(`${moduleId}.`));
      const finalPerms = !hasAll ? [...filtered, ...allModulePermIds] : filtered;
      return { ...prev, permissions: finalPerms };
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !validateRole(editingRole)) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (editingRole.id) {
        const updatedRole = editingRole as Role;
        setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
        notify?.(`Policy logic for '${updatedRole.display_name}' committed to ledger.`, "success");
      } else {
        const createdRole: Role = {
          id: `role-${Math.random().toString(36).substr(2, 5)}`,
          name: editingRole.name!,
          display_name: editingRole.display_name!,
          is_active: !!editingRole.is_active,
          permissions: editingRole.permissions || [],
          created_at: new Date().toISOString().split('T')[0]
        };
        setRoles(prev => [...prev, createdRole]);
        notify?.(`Identity role '${createdRole.display_name}' registered.`, "success");
      }
      setShowRoleModal(false);
      setEditingRole(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = (id: string, name: string) => {
    if (id === 'role-sa') {
      notify?.("Protocol violation: System-critical roles cannot be terminated.", "error");
      return;
    }
    if (window.confirm(`Terminate role '${name}'? All assigned staff will lose associated gateways immediately.`)) {
      setRoles(prev => prev.filter(r => r.id !== id));
      notify?.(`Role purged from security matrix.`, "info");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Configuration</h2>
          <p className="text-gray-500 mt-1">Manage global parameters, RBAC nodes, and security policy architecture.</p>
        </div>
        <button 
          onClick={() => notify?.("Global configuration synchronized with all regional hubs.", "success")}
          className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
        >
          Sync Protocol
        </button>
      </header>

      <div className="flex gap-8">
        <div className="w-64 space-y-1">
          {[
            { id: 'general', label: 'General Identity', icon: '🏠' },
            { id: 'rbac', label: 'Governance & RBAC', icon: '🔐' },
            { id: 'payments', label: 'Treasury Settings', icon: '💳' },
            { id: 'integration', label: 'Network Bridges', icon: '🔗' },
          ].map(group => (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id as any)}
              className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${
                activeTab === group.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span>{group.icon}</span>
              {group.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px]">
          {activeTab === 'rbac' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900">RBAC Identity Matrix</h3>
                <button 
                  onClick={() => { setEditingRole({ permissions: [], is_active: true }); setErrors({}); setShowRoleModal(true); }} 
                  className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 active:scale-95 transition-all"
                >
                  Define New Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                  <div key={role.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group">
                    <div className="flex justify-between mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl">🛡️</div>
                      <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${role.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {role.is_active ? 'ENABLED' : 'OFFLINE'}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900">{role.display_name}</h4>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em] mb-4">{role.name}</p>
                    <p className="text-xs text-gray-400 font-bold mb-6">
                      {role.permissions.includes('*') ? 'Full System Authorization' : `${role.permissions.length} Action Gateways Grant`}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingRole(role); setErrors({}); setShowRoleModal(true); }}
                        className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                      >
                        Modify Policy
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role.id, role.display_name)}
                        className="p-3 bg-white border border-gray-200 rounded-xl text-xs text-red-500 hover:bg-red-50 transition-all"
                        title="Delete Role"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showRoleModal && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                  <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                    <form onSubmit={handleSaveRole} className="flex flex-col h-full">
                      <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                            {editingRole?.id ? 'Edit Access Identity' : 'Define Security Identity'}
                          </h3>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Protocol Initialization</p>
                        </div>
                        <button type="button" onClick={() => setShowRoleModal(false)} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">✕</button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Title</label>
                            <input 
                              type="text" 
                              required
                              value={editingRole?.display_name || ''} 
                              onChange={e => setEditingRole({...editingRole, display_name: e.target.value})}
                              className={`w-full bg-gray-50 border ${errors.display_name ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900`}
                              placeholder="e.g. Regional Manager"
                            />
                            {errors.display_name && <p className="text-red-500 text-[10px] font-black mt-2 uppercase">{errors.display_name[0]}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">System Identifier Key</label>
                            <input 
                              type="text" 
                              required
                              value={editingRole?.name || ''} 
                              onChange={e => setEditingRole({...editingRole, name: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                              className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-100'} rounded-2xl px-6 py-4 font-mono font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-indigo-600`}
                              placeholder="e.g. regional-manager"
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-black mt-2 uppercase">{errors.name[0]}</p>}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Permission Node Matrix</h4>
                            <div className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                              <span className="text-[9px] font-black text-gray-400 uppercase">Status</span>
                              <button 
                                type="button"
                                onClick={() => setEditingRole({...editingRole, is_active: !editingRole?.is_active})}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black transition-all ${editingRole?.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                              >
                                {editingRole?.is_active ? 'ACTIVE' : 'OFFLINE'}
                              </button>
                            </div>
                          </div>
                          {errors.permissions && <p className="text-red-500 text-[10px] font-black uppercase">{errors.permissions[0]}</p>}
                          <PermissionMatrix 
                            rolesPermissions={editingRole?.permissions} 
                            onToggle={handleTogglePermission}
                            onToggleModule={handleToggleModule}
                          />
                        </div>
                      </div>

                      <div className="p-10 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
                        <button type="button" onClick={() => setShowRoleModal(false)} className="px-10 py-3 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all">Discard</button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="px-14 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-all"
                        >
                          {isSubmitting ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Processing...</> : 'Save Policy Identity'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="col-span-2">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Enterprise Official Name</label>
                   <input type="text" value={settings.store_name} onChange={e => setSettings({...settings, store_name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black outline-none text-gray-900" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Primary Treasury Currency</label>
                   <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black outline-none text-gray-900">
                     <option value="USD">United States Dollar (USD)</option>
                     <option value="EUR">Euro (EUR)</option>
                     <option value="GBP">Pound Sterling (GBP)</option>
                   </select>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;