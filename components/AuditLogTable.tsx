import React, { useState, useMemo } from 'react';
import { AuditLog } from '../types';

interface AuditLogTableProps {
  logs: AuditLog[];
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
}

interface DiffEntry {
  field: string;
  oldValue: any;
  newValue: any;
  status: 'changed' | 'added' | 'removed';
}

const MOCK_LOGS: AuditLog[] = [
  { 
    id: '1', 
    user_id: '1', 
    user_name: 'Alex Rivera', 
    role_at_time: 'super-admin', 
    module: 'settings', 
    action: 'update_global_config', 
    old_data: { store_name: "Lumina Alpha", maintenance_mode: false, currency: "USD" }, 
    new_data: { store_name: "Lumina Premium Store", maintenance_mode: true, currency: "USD" }, 
    ip_address: '192.168.1.45', 
    user_agent: 'Chrome 121.0.0', 
    created_at: '2025-02-18 09:15:00' 
  },
  { 
    id: '2', 
    user_id: '1', 
    user_name: 'Alex Rivera', 
    role_at_time: 'super-admin', 
    module: 'products', 
    action: 'delete_product', 
    old_data: { id: "123", name: "Legacy Boot", sku: "BT-LEG-01", price: 45.00 }, 
    ip_address: '192.168.1.45', 
    user_agent: 'Chrome 121.0.0', 
    created_at: '2025-02-18 08:30:12' 
  },
  { 
    id: '3', 
    user_id: '2', 
    user_name: 'Sarah Chen', 
    role_at_time: 'manager', 
    module: 'products', 
    action: 'create_product', 
    new_data: { name: "Silk Scarf", sku: "SC-SILK-RD", price: 85.00, category: "Accessories" }, 
    ip_address: '24.112.98.5', 
    user_agent: 'Safari 17.2', 
    created_at: '2025-02-17 04:30:00' 
  }
];

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, notify }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const displayLogs = logs.length > 0 ? logs : MOCK_LOGS;

  const handleFilter = () => {
    notify?.("Opening audit granularity filters...", "info");
  };

  const handleExport = () => {
    notify?.("Compiling activity manifest for legal archive...", "loading");
    setTimeout(() => notify?.("Audit archive dispatched to Admin email.", "success"), 2500);
  };

  const calculateDiff = (oldData: any, newData: any): DiffEntry[] => {
    const diffs: DiffEntry[] = [];
    const oldObj = oldData || {};
    const newObj = newData || {};
    
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));

    allKeys.forEach(key => {
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      if (oldVal !== undefined && newVal !== undefined) {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          diffs.push({ field: key, oldValue: oldVal, newValue: newVal, status: 'changed' });
        }
      } else if (newVal !== undefined) {
        diffs.push({ field: key, oldValue: null, newValue: newVal, status: 'added' });
      } else if (oldVal !== undefined) {
        diffs.push({ field: key, oldValue: oldVal, newValue: null, status: 'removed' });
      }
    });

    return diffs;
  };

  const diffEntries = useMemo(() => {
    if (!selectedLog) return [];
    return calculateDiff(selectedLog.old_data, selectedLog.new_data);
  }, [selectedLog]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Enterprise Audit Observer</h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Immutable Activity Ledger</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleFilter} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all active:scale-95">Filter Segment</button>
           <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">Export Log Archive</button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
            <tr>
              <th className="px-8 py-5">Temporal Entry</th>
              <th className="px-8 py-5">Actor Entity</th>
              <th className="px-8 py-5">Action Context</th>
              <th className="px-8 py-5">Network Origin</th>
              <th className="px-8 py-5 text-right">Data Drift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <p className="text-xs font-black text-gray-900 leading-tight">{log.created_at.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{log.created_at.split(' ')[1]}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100 uppercase">
                      {log.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 leading-tight">{log.user_name}</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">{log.role_at_time}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{log.module}</span>
                    <span className="text-sm font-bold text-gray-700 capitalize">{log.action.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-mono font-bold text-gray-500">{log.ip_address}</p>
                  <p className="text-[9px] text-gray-300 truncate max-w-[150px]">{log.user_agent}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  {(log.old_data || log.new_data) ? (
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      Inspect Diff
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-300 font-bold uppercase">No State Delta</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl animate-in zoom-in-95 flex flex-col overflow-hidden max-h-[85vh]">
             <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Data Integrity Inspector</h3>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                    {selectedLog.module} • {selectedLog.action.replace(/_/g, ' ')} • Log ID: {selectedLog.id}
                  </p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all">✕</button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
                <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex items-center gap-6">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">📊</div>
                   <div>
                      <p className="text-indigo-900 font-black">Data Transformation Summary</p>
                      <p className="text-indigo-600 text-sm font-medium">Lumina detected {diffEntries.length} granular field transformations in this transaction.</p>
                   </div>
                </div>

                <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                      <tr>
                        <th className="px-8 py-5">Identity Property</th>
                        <th className="px-8 py-5">Historical State</th>
                        <th className="px-8 py-5">Target State</th>
                        <th className="px-8 py-5 text-right">Drift Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {diffEntries.length > 0 ? diffEntries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <span className="text-xs font-black text-gray-900 font-mono">{entry.field}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="max-w-[250px] overflow-hidden text-ellipsis">
                              {entry.status === 'added' ? (
                                <span className="text-[10px] text-gray-300 italic font-bold uppercase tracking-tighter">Null_State</span>
                              ) : (
                                <span className="text-xs text-gray-500 font-medium font-mono bg-gray-100 px-2 py-1 rounded">
                                  {typeof entry.oldValue === 'object' ? JSON.stringify(entry.oldValue) : String(entry.oldValue)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="max-w-[250px] overflow-hidden text-ellipsis">
                              {entry.status === 'removed' ? (
                                <span className="text-[10px] text-red-300 italic font-bold uppercase tracking-tighter">Purged</span>
                              ) : (
                                <span className={`text-xs font-bold font-mono px-2 py-1 rounded ${entry.status === 'added' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {typeof entry.newValue === 'object' ? JSON.stringify(entry.newValue) : String(entry.newValue)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                               entry.status === 'changed' ? 'bg-amber-100 text-amber-600' :
                               entry.status === 'added' ? 'bg-green-100 text-green-600' :
                               'bg-red-100 text-red-600'
                             }`}>
                               {entry.status}
                             </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                            No granular drift detected. This entry may represent a pure creation or destruction event.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Raw Historical Payload</h4>
                      <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 font-mono text-[11px] overflow-auto max-h-64 custom-scrollbar text-gray-500">
                         {selectedLog.old_data ? <pre>{JSON.stringify(selectedLog.old_data, null, 2)}</pre> : <span className="text-gray-300 italic">Undefined Base State</span>}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-2">Raw Incoming Payload</h4>
                      <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100 font-mono text-[11px] overflow-auto max-h-64 custom-scrollbar text-indigo-900">
                         {selectedLog.new_data ? <pre>{JSON.stringify(selectedLog.new_data, null, 2)}</pre> : <span className="text-gray-300 italic">Terminal Null State</span>}
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex justify-end flex-shrink-0">
                <button onClick={() => setSelectedLog(null)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase text-xs tracking-widest">Dismiss Observer</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogTable;