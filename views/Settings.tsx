import React, { useState, useMemo, useRef } from 'react';
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

  // Input refs for scrolling
  const roleNameRef = useRef<HTMLInputElement>(null);
  const permsContainerRef = useRef<HTMLDivElement>(null);

  const roleValidationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!editingRole) return errs;
    if (!editingRole.display_name?.trim()) errs.display_name = "Role identity title is required.";
    if (!editingRole.permissions || editingRole.permissions.length === 0) {
      errs.permissions = "Assign at least one permission node to this role.";
    }
    return errs;
  }, [editingRole]);

  const isRoleValid = Object.keys(roleValidationErrors).length === 0;

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!editingRole || !isRoleValid) {
      notify?.("Policy validation failed. Resolve missing nodes before committing.", "error");
      
      if (roleValidationErrors.display_name) {
        roleNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        roleNameRef.current?.focus();
      } else if (roleValidationErrors.permissions) {
        permsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (editingRole.id) {
        const updatedRole = editingRole as Role;
        setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
        notify?.(`Security policy updated.`, "success");
      } else {
        const createdRole: Role = {
          ...editingRole,
          id: `role-${Math.random().toString(36).substr(2, 5)}`,
          name: editingRole.display_name?.toLowerCase().replace(/\s+/g, '-') || 'new-role',
          created_at: new Date().toISOString().split('T')[0],
        } as Role;
        setRoles(prev => [...prev, createdRole]);
        notify?.(`New role registered.`, "success");
      }
      setShowRoleModal(false);
      setEditingRole(null);
      setTouched(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISuggest = async () => {
    if (!editingRole?.display_name?.trim()) {
      notify?.("Enter a role name first for Lumina to analyze.", "error");
      return;
    }
    setIsAISuggesting(true);
    const result = await suggestPermissions(editingRole.display_name, roleScope);
    if (result) {
      setEditingRole(prev => ({ ...prev, permissions: result.permissions }));
      setAiReasoning(result.reasoning);
      notify?.("Policy matrix synthesized.", "success");
    }
    setIsAISuggesting(false);
  };

  const handleTogglePermission = (moduleId: ModuleType, action: ActionType) => {
    const permId = `${moduleId}.${action}`;
    setEditingRole(prev => {
      if (!prev) return null;
      const current = prev.permissions || [];
      const updated = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
      return { ...prev, permissions: updated };
    });
  };

  const handleToggleModule = (moduleId: ModuleType) => {
    const allModulePermIds = ACTIONS.map(a => `${moduleId}.${a}`);
    const hasAll = allModulePermIds.every(id => (editingRole?.permissions || []).includes(id));
    setEditingRole(prev => {
      if (!prev) return null;
      const basePerms = (prev.permissions || []).filter(p => !p.startsWith(`${moduleId}.`));
      return { ...prev, permissions: !hasAll ? [...basePerms, ...allModulePermIds] : basePerms };
    });
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">System Architecture</h2>
        <p className="text-gray-500 mt-6 font-medium text-lg max-w-xl">Configure administrative nodes and security matrices.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-72 flex-shrink-0 space-y-2">
          {['rbac', 'general', 'payments', 'integration'].map(id => (
            <button key={id} onClick={() => setActiveTab(id as any)} className={`w-full text-left px-8 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-2xl' : 'text-gray-400 hover:bg-white'}`}>
              {id === 'rbac' ? '🔐 Identity & RBAC' : id === 'general' ? '🏠 Store Identity' : id === 'payments' ? '💰 Treasury Nodes' : '🔗 External Hubs'}
            </button>
          ))}
        </aside>

        <main className="flex-1 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[600px]">
          {activeTab === 'rbac' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security Personas</h3>
                <button onClick={() => { setEditingRole({ permissions: [], is_active: true, display_name: '' }); setTouched(false); setShowRoleModal(true); }} className="px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Create Persona</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {roles.map(role => (
                  <div key={role.id} className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] hover:shadow-xl transition-all flex flex-col min-h-[250px]">
                    <h4 className="text-xl font-black text-gray-900 leading-tight mb-2 truncate">{role.display_name}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-8">{role.permissions.includes('*') ? 'Unrestricted System Access' : `${role.permissions.length} Granular Permission Gates`}</p>
                    <button onClick={() => { setEditingRole(role); setShowRoleModal(true); setTouched(false); }} className="mt-auto py-3.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">Edit Policy</button>
                  </div>
                ))}
              </div>

              {showRoleModal && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
                  <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                    <form onSubmit={handleSaveRole} className="flex flex-col h-full overflow-hidden">
                      <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{editingRole?.id ? 'Edit Access Identity' : 'Define New Identity'}</h3>
                        <button type="button" onClick={() => setShowRoleModal(false)} className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 text-xl">✕</button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                        <div className="space-y-4">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Persona Title</label>
                          <input 
                            ref={roleNameRef}
                            type="text" 
                            required
                            value={editingRole?.display_name || ''} 
                            onChange={e => setEditingRole(prev => ({ ...prev, display_name: e.target.value }))}
                            className={`w-full bg-gray-50 border ${roleValidationErrors.display_name && touched ? 'border-rose-500 ring-4 ring-rose-50' : 'border-gray-200 focus:border-indigo-500'} rounded-2xl px-8 py-5 font-black outline-none transition-all text-gray-900 text-lg shadow-inner`}
                            placeholder="e.g. Content Curator"
                          />
                          {roleValidationErrors.display_name && touched && <p className="text-rose-500 text-[10px] font-black uppercase mt-3 ml-2 animate-in slide-in-from-top-1">⚠️ {roleValidationErrors.display_name}</p>}
                        </div>

                        <div className="bg-indigo-900 p-10 rounded-[3rem] space-y-8 shadow-2xl shadow-indigo-100">
                          <div className="flex justify-between items-center text-white">
                             <div className="flex items-center gap-4">
                               <span className="text-3xl">✨</span>
                               <div><h4 className="text-xs font-black uppercase tracking-[0.3em]">AI Security Architect</h4></div>
                             </div>
                             <button type="button" onClick={handleAISuggest} disabled={isAISuggesting || !editingRole?.display_name} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase bg-white text-indigo-900 shadow-xl">Synthesize Matrix</button>
                          </div>
                          <textarea rows={2} value={roleScope} onChange={(e) => setRoleScope(e.target.value)} className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-indigo-300/50 outline-none" placeholder="Provide context for Gemini to tailor the policy..." />
                        </div>

                        <div ref={permsContainerRef} className="space-y-8">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Operational Gateways</h4>
                          {roleValidationErrors.permissions && touched && <p className="text-rose-600 text-[11px] font-black uppercase text-center py-8 bg-rose-50 rounded-[2rem] border border-rose-100 shadow-sm animate-in zoom-in-95">⚠️ {roleValidationErrors.permissions}</p>}
                          <PermissionMatrix rolesPermissions={editingRole?.permissions} onToggle={handleTogglePermission} onToggleModule={handleToggleModule} />
                        </div>
                      </div>

                      <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-end gap-6">
                        <button type="button" onClick={() => setShowRoleModal(false)} className="px-10 py-5 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all uppercase text-[10px]">Discard</button>
                        <button type="submit" disabled={isSubmitting || (touched && !isRoleValid)} className={`px-16 py-5 rounded-[1.5rem] font-black transition-all active:scale-95 flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.3em] ${(!isRoleValid && touched) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100'}`}>
                          {isSubmitting ? <span className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Commit Persona'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;