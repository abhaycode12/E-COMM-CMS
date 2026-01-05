
import React from 'react';
import { ActionType, ModuleType, UserPermissionOverride } from '../types';

interface PermissionMatrixProps {
  rolesPermissions?: string[]; // Permissions inherited from roles
  overrides?: UserPermissionOverride[];
  onToggle?: (moduleId: ModuleType, action: ActionType) => void;
  onToggleModule?: (moduleId: ModuleType, currentPermissions: string[]) => void;
  readOnly?: boolean;
}

const MODULES: ModuleType[] = ['users', 'roles', 'products', 'categories', 'orders', 'customers', 'payments', 'reports', 'settings', 'content'];
const ACTIONS: ActionType[] = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ 
  rolesPermissions = [], 
  overrides = [], 
  onToggle,
  onToggleModule,
  readOnly = false
}) => {
  const getPermissionId = (module: ModuleType, action: ActionType) => `${module}.${action}`;

  const getPermissionState = (module: ModuleType, action: ActionType) => {
    const id = getPermissionId(module, action);
    const override = overrides.find(o => o.permission_id === id);
    const isInherited = rolesPermissions.includes(id) || rolesPermissions.includes('*');

    if (override !== undefined) {
      return { active: override.is_allowed, type: 'override' as const };
    }
    return { active: isInherited, type: 'inherited' as const };
  };

  return (
    <div className="border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
            <tr>
              <th className="px-8 py-5">System Module</th>
              <th className="px-4 py-5 text-center">Master</th>
              {ACTIONS.map(action => (
                <th key={action} className="px-4 py-5 text-center">{action}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MODULES.map(module => {
              const modulePerms = ACTIONS.map(a => getPermissionState(module, a));
              const allActive = modulePerms.every(p => p.active);

              return (
                <tr key={module} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-900 capitalize">{module}</span>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button
                      type="button"
                      disabled={readOnly || !onToggleModule}
                      onClick={() => onToggleModule?.(module, [])}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
                        allActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-300'
                      }`}
                    >
                      <span className="text-[10px] font-black">{allActive ? 'ALL' : 'OFF'}</span>
                    </button>
                  </td>
                  {ACTIONS.map(action => {
                    const state = getPermissionState(module, action);
                    return (
                      <td key={action} className="px-4 py-5 text-center">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => onToggle?.(module, action)}
                          className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition-all relative group
                            ${state.active 
                              ? (state.type === 'override' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-100 text-indigo-600') 
                              : (state.type === 'override' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-50 text-gray-300')}
                            ${readOnly ? 'cursor-not-allowed opacity-60' : 'active:scale-90'}
                          `}
                        >
                          <span className="text-xs">{state.active ? '✓' : '✕'}</span>
                          {state.type === 'override' && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full animate-pulse"></span>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {state.type === 'override' ? `Explicit ${state.active ? 'Allow' : 'Deny'}` : 'Inherited from Role'}
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionMatrix;
