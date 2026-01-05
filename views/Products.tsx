
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import OptimizedImage from '../components/OptimizedImage';

interface ProductsProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
  removeNotify?: (id: string) => void;
}

const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Premium Leather Boots', 
    slug: 'premium-leather-boots',
    category_id: 'cat-1',
    category_name: 'Footwear',
    brand: 'Lumina Premium',
    status: 'active', 
    description: 'Handcrafted leather boots...', 
    images: [{ id: 'img-1', path: 'https://picsum.photos/400/400?random=10', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v1', sku: 'BT-001-BR-10', price: 129.99, stock_quantity: 15, attributes: { color: 'Brown', size: '10' } },
      { id: 'v2', sku: 'BT-001-BK-10', price: 129.99, stock_quantity: 30, attributes: { color: 'Black', size: '10' } }
    ]
  },
  { 
    id: '2', 
    name: 'Silk Flow Dress', 
    slug: 'silk-flow-dress',
    category_id: 'cat-2',
    category_name: 'Apparel',
    brand: 'Lumina Luxury',
    status: 'active', 
    description: 'Elegant silk flow dress...', 
    images: [{ id: 'img-2', path: 'https://picsum.photos/400/400?random=11', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v3', sku: 'DR-882-RD-M', price: 89.00, stock_quantity: 45, attributes: { color: 'Red', size: 'M' } }
    ]
  }
];

const Products: React.FC<ProductsProps> = ({ notify, removeNotify }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || p.category_name === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setShowExportOptions(false);
    const loadingId = notify?.(`Preparing ${format.toUpperCase()} export manifest...`, 'loading');
    setTimeout(() => {
      if (loadingId && removeNotify) removeNotify(loadingId);
      notify?.(`${format.toUpperCase()} export staging complete. Check storage bucket.`, "success");
    }, 1500);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));
    
    notify?.(`Product "${editingProduct?.name || 'New Item'}" has been synchronized with the catalog.`, "success");
    setShowModal(false);
    setIsSubmitting(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Optimized Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-visible">
        <div className="relative z-10 space-y-2">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Product Inventory</h2>
          <p className="text-gray-500 font-medium text-lg">Manage multi-channel catalog & stock levels.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto relative z-[20]">
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="h-14 px-8 bg-gray-50 text-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-200 flex items-center justify-center gap-3 w-full sm:w-auto active:scale-95"
            >
              <span className="text-lg">📥</span> Export Matrix
            </button>
            {showExportOptions && (
              <div className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-[50] min-w-[220px] animate-in zoom-in-95 slide-in-from-top-2">
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3">
                   <span className="text-base">📄</span> Financial PDF
                </button>
                <button onClick={() => handleExport('excel')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-50 hover:text-green-600 transition-all flex items-center gap-3">
                   <span className="text-base">📊</span> Inventory Excel
                </button>
                <button onClick={() => handleExport('csv')} className="w-full text-left px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-3">
                   <span className="text-base">📝</span> Semantic CSV
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => { setEditingProduct({ name: '', brand: '', status: 'active' }); setShowModal(true); }}
            className="h-14 px-10 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 w-full sm:w-auto"
          >
            <span className="text-lg">➕</span> Initialize Product
          </button>
        </div>
      </header>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="relative lg:col-span-2">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by Title, SKU, or Brand..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none cursor-pointer hover:bg-gray-100 transition-all"
        >
          <option value="all">All Categories</option>
          <option value="Footwear">Footwear</option>
          <option value="Apparel">Apparel</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black text-[10px] uppercase tracking-widest text-gray-500 outline-none cursor-pointer hover:bg-gray-100 transition-all"
        >
          <option value="all">All Status</option>
          <option value="active">Active Catalog</option>
          <option value="draft">Draft Protocol</option>
          <option value="archived">Archived Node</option>
        </select>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.25em] font-black border-b border-gray-100">
              <tr>
                <th className="px-10 py-8">Product Entity</th>
                <th className="px-10 py-8">Primary SKU</th>
                <th className="px-10 py-8">Aggregate Stock</th>
                <th className="px-10 py-8">MSRP / Price</th>
                <th className="px-10 py-8">Lifecycle</th>
                <th className="px-10 py-8 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200">
                        <OptimizedImage src={p.images[0]?.path} alt={p.name} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg tracking-tight leading-tight">{p.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-widest">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">{p.variants[0]?.sku}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-800 text-xl">{p.variants.reduce((acc, v) => acc + v.stock_quantity, 0)}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Units</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="font-black text-gray-900 text-xl tracking-tighter">${p.variants[0]?.price.toFixed(2)}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
                      <button className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-all">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Fidelity Modal Implementation */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 sm:p-10">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Initialize Product Catalog</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Lifecycle Node: {editingProduct?.id || 'NEW_MANIFEST'}</p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setEditingProduct(null); }}
                className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition-all active:scale-90"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Product Name / Title</label>
                  <input 
                    type="text" 
                    required
                    value={editingProduct?.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xl text-gray-900"
                    placeholder="e.g. Aero-Tech Runner V2"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Manufacturer Brand</label>
                  <input 
                    type="text" 
                    value={editingProduct?.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900"
                    placeholder="e.g. Lumina Pro"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Category Placement</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900 appearance-none cursor-pointer"
                    value={editingProduct?.category_name || 'Footwear'}
                    onChange={e => setEditingProduct({ ...editingProduct, category_name: e.target.value })}
                  >
                    <option>Footwear</option>
                    <option>Apparel</option>
                    <option>Accessories</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lifecycle Status</label>
                  <div className="flex gap-4">
                    {['active', 'draft', 'archived'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, status: status as any })}
                        className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                          editingProduct?.status === status 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                          : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-white hover:border-indigo-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="p-10 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
              <button 
                type="button"
                onClick={() => { setShowModal(false); setEditingProduct(null); }}
                className="px-8 py-4 font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest text-[11px]"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSaveProduct}
                disabled={isSubmitting}
                className="px-14 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-100 active:scale-95 transition-all flex items-center gap-3"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : 'Commit Sync'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
