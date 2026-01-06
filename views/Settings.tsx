
import React, { useState, useMemo } from 'react';
import { SystemSettings, Role, ModuleType, ActionType } from '../types';
import PermissionMatrix from '../components/PermissionMatrix';
import { suggestPermissions } from '../services/geminiService';

interface SettingsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
  removeNotify?: (id: string) => void;
}

const MOCK_ROLES: Role[] = [
  { id: 'role-sa', name: 'super-admin', display_name: 'Super Administrator', is_active: true, permissions: ['*'], created_at: '2025-01-01' },
  { id: 'role-manager', name: 'manager', display_name: 'Store Manager', is_active: true, permissions: ['products.view', 'products.create', 'products.edit', 'orders.view', 'orders.approve'], created_at: '2025-01-05' },
  { id: 'role-support', name: 'support', display_name: 'Support Agent', is_active: true, permissions: ['customers.view', 'orders.view'], created_at: '2025-01-10' },
];

const ACTIONS: ActionType[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

const Settings: React.FC<SettingsProps> = ({ notify, removeNotify }) => {
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

  const [activeTab, setActiveTab] = useState<'general' | 'rbac' | 'payments' | 'integration'>('rbac');
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [roleScope, setRoleScope] = useState('');
  const [touched, setTouched] = useState(false);
  
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);

  const roleValidationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!editingRole) return errs;
    if (!editingRole.display_name?.trim()) errs.display_name = "Role identity title is required.";
    if (!editingRole.name?.trim()) errs.name = "Policy identifier slug is required.";
    if (!editingRole.permissions || editingRole.permissions.length === 0) {
      errs.permissions = "Assign at least one permission node to this role.";
    }
    return errs;
  }, [editingRole]);

  const isRoleValid = Object.keys(roleValidationErrors).length === 0;

  const handleAISuggest = async () => {
    if (!editingRole?.display_name?.trim()) {
      notify?.("Enter a role name first for Lumina to analyze requirements.", "error");
      return;
    }

    setIsAISuggesting(true);
    setAiReasoning(null);
    const loadId = notify?.(`Lumina is architecting a least-privilege policy for "${editingRole.display_name}"...`, 'loading');
    
    try {
      const result = await suggestPermissions(editingRole.display_name, roleScope);
      if (loadId && removeNotify) removeNotify(loadId);

      if (result) {
        setEditingRole(prev => ({ ...prev, permissions: result.permissions }));
        setAiReasoning(result.reasoning);
        notify?.(`Suggested ${result.permissions.length} permission nodes based on role persona.`, "success");
      }
    } catch (error) {
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.("AI security synthesis interrupted. Check connection.", "error");
    } finally {
      setIsAISuggesting(false);
    }
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
    setAiReasoning(null);
  };

  const handleToggleModule = (moduleId: ModuleType) => {
    const allModulePermIds = ACTIONS.map(a => `${moduleId}.${a}`);
    const hasAll = allModulePermIds.every(id => (editingRole?.permissions || []).includes(id));

    setEditingRole(prev => {
      if (!prev) return null;
      const basePerms = (prev.permissions || []).filter(p => !p.startsWith(`${moduleId}.`));
      const finalPerms = !hasAll ? [...basePerms, ...allModulePermIds] : basePerms;
      return { ...prev, permissions: finalPerms };
    });
    setAiReasoning(null);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!editingRole || !isRoleValid) {
      notify?.("Policy validation failed. Resolve missing nodes before committing.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (editingRole.id) {
        const updatedRole = editingRole as Role;
        setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
        notify?.(`Security policy for "${updatedRole.display_name}" updated in system core.`, "success");
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
        notify?.(`New role identity "${createdRole.display_name}" registered.`, "success");
      }
      setShowRoleModal(false);
      setEditingRole(null);
      setAiReasoning(null);
      setRoleScope('');
      setTouched(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setRoleScope('');
    setAiReasoning(null);
    setTouched(false);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (id: string, name: string) => {
    if (id === 'role-sa') {
      notify?.("System Constraint: Root Administrator role cannot be terminated.", "error");
      return;
    }
    if (window.confirm(`Terminate role "${name}"? This will immediately revoke access for all assigned personnel.`)) {
      setRoles(prev => prev.filter(r => r.id !== id));
      notify?.(`Role purged from system registry.`, "info");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">System Architecture</h2>
          <p className="text-gray-500 mt-6 font-medium text-lg max-w-xl">Configure administrative nodes, regional treasury rules, and the AI security matrix.</p>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl"></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-72 flex-shrink-0 space-y-2">
          {[
            { id: 'rbac', label: 'Identity & RBAC', icon: '🔐' },
            { id: 'general', label: 'Store Identity', icon: '🏠' },
            { id: 'payments', label: 'Treasury Nodes', icon: '💰' },
            { id: 'integration', label: 'External Hubs', icon: '🔗' },
          ].map(group => (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id as any)}
              className={`w-full text-left px-8 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-4 ${
                activeTab === group.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]' : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{group.icon}</span>
              {group.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[600px] min-w-0">
          {activeTab === 'rbac' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security Personas</h3>
                   <p className="text-sm font-medium text-gray-500">Define operational roles and their respective system gateways.</p>
                </div>
                <button 
                  onClick={() => { setEditingRole({ permissions: [], is_active: true, display_name: '', name: '' }); setTouched(false); setRoleScope(''); setAiReasoning(null); setShowRoleModal(true); }} 
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white active:scale-95 transition-all shadow-sm"
                >
                  Create New Persona
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {roles.map(role => (
                  <div key={role.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col min-h-[300px]">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-3xl">🛡️</div>
                      <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${role.is_active ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-red-100 text-red-700 shadow-sm'}`}>
                        {role.is_active ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-gray-900 leading-tight mb-2 truncate">{role.display_name}</h4>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">ID: {role.name}</p>
                      <p className="text-xs text-gray-400 font-bold mb-8 leading-relaxed">
                        {role.permissions.includes('*') ? 'Unrestricted System Access' : `${role.permissions.length} Granular Permission Gates`}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-6 border-t border-gray-100">
                      <button 
                        onClick={() => handleEditRole(role)}
                        className="flex-1 py-3.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 shadow-sm"
                      >
                        Edit Policy
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(role.id, role.display_name)}
                        className="p-3.5 bg-white border border-gray-200 rounded-xl text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 shadow-sm"
                        title="Purge Role"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showRoleModal && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
                  <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                    <form onSubmit={handleSaveRole} className="flex flex-col h-full overflow-hidden">
                      <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30 flex-shrink-0">
                        <div>
                          <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                            {editingRole?.id ? 'Edit Access Identity' : 'Define New Identity'}
                          </h3>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-4">Node Ledger • {editingRole?.id || 'NEW_MANIFEST'}</p>
                        </div>
                        <button type="button" onClick={() => setShowRoleModal(false)} className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all text-xl">✕</button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                        <div className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Persona Title (e.g. Sales Director)</label>
                              <input 
                                type="text" 
                                required
                                value={editingRole?.display_name || ''} 
                                onChange={e => {
                                  const val = e.target.value;
                                  setEditingRole(prev => ({ 
                                    ...prev, 
                                    display_name: val,
                                    name: prev?.id ? prev.name : val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                  }));
                                }}
                                className={`w-full bg-gray-50 border ${roleValidationErrors.display_name && touched ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-indigo-500'} rounded-2xl px-8 py-5 font-black outline-none transition-all text-gray-900 text-lg shadow-inner`}
                                placeholder="Inventory Analyst"
                              />
                              {roleValidationErrors.display_name && touched && <p className="text-red-500 text-[9px] font-black mt-1 uppercase ml-2">{roleValidationErrors.display_name}</p>}
                            </div>
                            <div className="space-y-4">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Internal Slug (Policy ID)</label>
                              <input 
                                type="text" 
                                readOnly
                                value={editingRole?.name || ''} 
                                className={`w-full bg-gray-100 border border-gray-100 rounded-2xl px-8 py-5 font-mono font-bold outline-none text-indigo-400 cursor-not-allowed opacity-60 text-lg`}
                              />
                            </div>
                          </div>

                          <div className="bg-indigo-900 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group shadow-2xl shadow-indigo-100">
                            <div className="flex justify-between items-center relative z-10">
                               <div className="flex items-center gap-4 text-white">
                                 <span className="text-3xl">✨</span>
                                 <div>
                                   <h4 className="text-xs font-black uppercase tracking-[0.3em]">AI Security Architect</h4>
                                   <p className="text-[10px] text-indigo-200 font-bold mt-1">Lumina uses Gemini to synthesize optimal policy matrices.</p>
                                 </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={handleAISuggest}
                                 disabled={isAISuggesting || !editingRole?.display_name}
                                 className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${isAISuggesting || !editingRole?.display_name ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95'}`}
                               >
                                 {isAISuggesting ? <span className="w-4 h-4 border-2 border-indigo-900/20 border-t-indigo-900 rounded-full animate-spin"></span> : "Synthesize Matrix"}
                               </button>
                            </div>
                            <div className="space-y-4 relative z-10">
                               <label className="block text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1">Contextual Goal / Job Description</label>
                               <textarea 
                                 rows={3}
                                 value={roleScope}
                                 onChange={(e) => setRoleScope(e.target.value)}
                                 className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder:text-indigo-300/50 outline-none focus:ring-8 focus:ring-white/5 focus:border-white/30 transition-all shadow-inner"
                                 placeholder="e.g. This user handles warehouse inbound logistics only. They should view products but not change prices or financial settings."
                               ></textarea>
                            </div>
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                          </div>
                        </div>

                        {aiReasoning && (
                          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white animate-in slide-in-from-top-2 duration-500 border border-gray-800">
                             <div className="flex items-center gap-3 mb-4">
                               <span className="text-xl">🧬</span>
                               <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Architectural Logic</h5>
                             </div>
                             <p className="text-sm font-medium italic text-indigo-100/80 leading-relaxed">"{aiReasoning}"</p>
                          </div>
                        )}

                        <div className="space-y-8">
                          <div className="flex justify-between items-end px-2">
                            <div className="space-y-2">
                              <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Operational Gateways</h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Toggle granular modules below to override AI suggestions.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active State</span>
                                <button 
                                  type="button"
                                  onClick={() => setEditingRole({...editingRole, is_active: !editingRole?.is_active})}
                                  className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${editingRole?.is_active ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-gray-100 text-gray-500'}`}
                                >
                                  {editingRole?.is_active ? 'ENABLED' : 'DISABLED'}
                                </button>
                            </div>
                          </div>
                          
                          {roleValidationErrors.permissions && touched && <p className="text-red-500 text-[10px] font-black uppercase text-center py-6 bg-red-50 rounded-2xl border border-red-100">{roleValidationErrors.permissions}</p>}
                          
                          <PermissionMatrix 
                            rolesPermissions={editingRole?.permissions} 
                            onToggle={handleTogglePermission}
                            onToggleModule={handleToggleModule}
                          />
                        </div>
                      </div>

                      <div className="p-10 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-6 bg-gray-50/50 flex-shrink-0">
                        <button type="button" onClick={() => setShowRoleModal(false)} className="px-10 py-5 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all uppercase text-[10px] tracking-widest">Discard Ledger</button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting || (touched && !isRoleValid)}
                          className={`
                            px-16 py-5 rounded-[1.5rem] font-black transition-all active:scale-95 flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.3em]
                            ${(!isRoleValid && touched) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100'}
                          `}
                        >
                          {isSubmitting ? <span className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Commit Persona'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab !== 'rbac' && (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
               <span className="text-6xl grayscale opacity-30">🛠️</span>
               <div>
                  <h4 className="text-xl font-black text-gray-400">Node Configuration Segment</h4>
                  <p className="text-sm font-medium text-gray-300">This module is currently undergoing periodic architectural sync.</p>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
