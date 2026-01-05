import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, ProductVariant, ProductImage } from '../types';
import OptimizedImage from '../components/OptimizedImage';
import { generateProductDescription, generateSEOTags } from '../services/geminiService';

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
    description: 'Handcrafted leather boots with premium grain leather and Goodyear welt construction.', 
    short_description: 'Handcrafted leather boots for the modern urban explorer.',
    images: [{ id: 'img-1', path: 'https://picsum.photos/400/400?random=10', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v1', sku: 'BT-001-BR-10', price: 129.99, stock_quantity: 15, attributes: { color: 'Brown', size: '10' } }
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
    description: 'A flowing silk dress that breathes elegance and comfort for any evening occasion.', 
    short_description: 'Elegant silk flow dress for evening events.',
    images: [{ id: 'img-2', path: 'https://picsum.photos/400/400?random=11', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v3', sku: 'DR-882-RD-M', price: 89.00, stock_quantity: 45, attributes: { color: 'Red', size: 'M' } }
    ]
  }
];

const INITIAL_FORM_STATE: Partial<Product> = {
  name: '',
  slug: '',
  brand: '',
  status: 'draft',
  category_name: 'Footwear',
  description: '',
  short_description: '',
  variants: [
    { id: 'v-' + Math.random().toString(36).substr(2, 5), sku: '', price: 0, stock_quantity: 0, attributes: {} }
  ],
  images: [],
  meta_title: '',
  meta_description: ''
};

const Products: React.FC<ProductsProps> = ({ notify, removeNotify }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'inventory' | 'media' | 'seo'>('general');
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>(INITIAL_FORM_STATE);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  // Bulk actions logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) setSelectedIds([]);
    else setSelectedIds(filteredProducts.map(p => p.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkStatus = (status: Product['status']) => {
    const loadId = notify?.(`Updating ${selectedIds.length} items to ${status}...`, 'loading');
    setTimeout(() => {
      setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status } : p));
      if (loadId && removeNotify) removeNotify(loadId);
      notify?.(`Bulk synchronization successful.`, 'success');
      setSelectedIds([]);
    }, 1000);
  };

  // Validation logic
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!editingProduct.name?.trim()) newErrors.name = "Entity title is mandatory.";
    if (!editingProduct.slug?.trim()) newErrors.slug = "Path slug is required.";
    if (editingProduct.meta_title && editingProduct.meta_title.length > 60) newErrors.meta_title = "Title exceeds 60 chars.";
    if (editingProduct.meta_description && editingProduct.meta_description.length > 160) newErrors.meta_description = "Snippet exceeds 160 chars.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editingProduct]);

  // AI Content generation
  const handleAIDescription = async () => {
    if (!editingProduct.name) return notify?.("Provide a title first.", "error");
    setIsAIGenerating(true);
    const desc = await generateProductDescription(editingProduct.name, [editingProduct.brand || '', editingProduct.category_name || '']);
    setEditingProduct(prev => ({ ...prev, description: desc }));
    setIsAIGenerating(false);
    notify?.("Product narrative synthesized by Gemini.", "success");
  };

  const handleAISEO = async () => {
    if (!editingProduct.name) return notify?.("Provide a title for semantic analysis.", "error");
    setIsAIGenerating(true);
    const seo = await generateSEOTags(editingProduct.name, editingProduct.description || '');
    if (seo) {
      setEditingProduct(prev => ({
        ...prev,
        meta_title: seo.title.slice(0, 60),
        meta_description: seo.metaDescription.slice(0, 160)
      }));
    }
    setIsAIGenerating(false);
    notify?.("SEO Metadata optimized.", "success");
  };

  // CRUD handlers
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify?.("Validation protocol failed. Check required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const finalProduct = {
      ...editingProduct,
      id: editingProduct.id || Math.random().toString(36).substr(2, 9),
      category_id: 'cat-1', // Default category for now
    } as Product;

    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === finalProduct.id ? finalProduct : p));
      notify?.(`Manifest for ${finalProduct.name} updated.`, "success");
    } else {
      setProducts(prev => [finalProduct, ...prev]);
      notify?.(`New node ${finalProduct.name} initialized in catalog.`, "success");
    }

    setIsSubmitting(false);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Purge this product entity? Sub-variants and media links will be terminated.")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      notify?.("Entity purged from system registry.", "info");
    }
  };

  // Media upload simulation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: ProductImage = {
          id: Math.random().toString(36).substr(2, 9),
          path: reader.result as string,
          is_primary: (editingProduct.images?.length || 0) === 0,
          sort_order: (editingProduct.images?.length || 0)
        };
        setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), newImg] }));
        notify?.("Asset staged for sync.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Product Inventory</h2>
          <p className="text-gray-500 font-medium text-lg">Orchestrate your multi-channel catalog at scale.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(INITIAL_FORM_STATE); setShowModal(true); setModalTab('general'); setErrors({}); }}
          className="h-16 px-12 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
        >
          <span>➕</span> Initialize Product
        </button>
      </header>

      {/* Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-6 z-[60] bg-gray-900 text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-8 px-6">
            <span className="text-sm font-black uppercase tracking-widest text-indigo-400">{selectedIds.length} Entities Selected</span>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex gap-4">
              <button onClick={() => handleBulkStatus('active')} className="px-6 py-3 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Publish</button>
              <button onClick={() => handleBulkStatus('draft')} className="px-6 py-3 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Draft</button>
              <button onClick={() => { if(window.confirm(`Purge ${selectedIds.length} items?`)) { setProducts(prev => prev.filter(p => !selectedIds.includes(p.id))); setSelectedIds([]); notify?.("Batch deletion successful.", "info"); } }} className="px-6 py-3 hover:bg-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Purge</button>
            </div>
          </div>
          <button onClick={() => setSelectedIds([])} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">✕</button>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-6">
          <div className="relative flex-1">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Search by Title, SKU, or Brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-[1.5rem] pl-16 pr-6 py-5 font-bold text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-lg"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black border-b border-gray-100">
              <tr>
                <th className="px-12 py-10">
                  <input type="checkbox" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleSelectAll} className="w-6 h-6 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                </th>
                <th className="px-12 py-10">Entity Identity</th>
                <th className="px-12 py-10">Economics</th>
                <th className="px-12 py-10">Inventory</th>
                <th className="px-12 py-10">Lifecycle</th>
                <th className="px-12 py-10 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className={`hover:bg-indigo-50/10 transition-all duration-300 group ${selectedIds.includes(p.id) ? 'bg-indigo-50/40' : ''}`}>
                  <td className="px-12 py-10">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="w-6 h-6 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden shadow-2xl border border-gray-100 group-hover:scale-105 transition-transform">
                        <OptimizedImage src={p.images[0]?.path} alt={p.name} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-2 tracking-[0.1em]">{p.brand} • {p.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 text-2xl tracking-tighter">${p.variants[0]?.price.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">SKU: {p.variants[0]?.sku}</span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`text-xl font-black ${p.variants[0]?.stock_quantity < 10 ? 'text-red-500' : 'text-gray-900'}`}>{p.variants[0]?.stock_quantity}</span>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-sm ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button onClick={() => { setEditingProduct(p); setModalTab('general'); setShowModal(true); setErrors({}); }} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-indigo-600 rounded-[1rem] shadow-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-90">✏️</button>
                      <button onClick={() => handleDelete(p.id)} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-red-500 rounded-[1rem] shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-90">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Initialize Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-[150] flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Head */}
            <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📦</span>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                    {editingProduct.id ? 'Refine Product' : 'Initialize Product'}
                  </h3>
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-3 ml-10">Identifier: {editingProduct.id || 'NEW_MANIFEST'}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all active:scale-90 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex px-10 border-b border-gray-50 bg-white gap-8 overflow-x-auto scrollbar-hide flex-shrink-0">
              {[
                { id: 'general', label: 'Primary Info', icon: '📝' },
                { id: 'inventory', label: 'Economics & Stock', icon: '🏷️' },
                { id: 'media', label: 'Visual Assets', icon: '📸' },
                { id: 'seo', label: 'Search Optimization', icon: '✨' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`py-6 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-4 flex items-center gap-3 whitespace-nowrap ${
                    modalTab === tab.id 
                      ? 'text-indigo-600 border-indigo-600' 
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {modalTab === 'general' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Product Master Title</label>
                      <input 
                        type="text" 
                        value={editingProduct.name || ''}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = editingProduct.id ? editingProduct.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setEditingProduct({...editingProduct, name, slug});
                        }}
                        className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200'} rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xl font-black text-gray-900`}
                        placeholder="e.g. Handcrafted Leather Boots"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">System Slug (Unique Path)</label>
                      <input 
                        type="text" 
                        value={editingProduct.slug || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, slug: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono font-bold text-indigo-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Brand Identity</label>
                      <input 
                        type="text" 
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none"
                        placeholder="Lumina Premium"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Detailed Manifest (Description)</label>
                        <button 
                          type="button"
                          onClick={handleAIDescription}
                          disabled={isAIGenerating}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          {isAIGenerating ? "Synthesizing..." : "✨ AI Generate"}
                        </button>
                      </div>
                      <textarea 
                        rows={6}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-6 font-medium text-gray-800 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all leading-relaxed"
                        placeholder="Describe the engineering and soul of this product..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'inventory' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-indigo-100">
                    <div>
                      <h4 className="text-2xl font-black tracking-tighter mb-2">Variant Orchestration</h4>
                      <p className="text-indigo-200 font-medium">Define price points, stock thresholds, and SKUs for the base variant.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Base SKU (Unique)</label>
                      <input 
                        type="text" 
                        value={editingProduct.variants?.[0]?.sku || ''}
                        onChange={(e) => {
                          const variants = [...(editingProduct.variants || [])];
                          variants[0] = { ...variants[0], sku: e.target.value };
                          setEditingProduct({ ...editingProduct, variants });
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono font-bold text-gray-900 outline-none"
                        placeholder="BT-001-BR-10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Retail Price ($)</label>
                      <input 
                        type="number" 
                        value={editingProduct.variants?.[0]?.price || ''}
                        onChange={(e) => {
                          const variants = [...(editingProduct.variants || [])];
                          variants[0] = { ...variants[0], price: parseFloat(e.target.value) };
                          setEditingProduct({ ...editingProduct, variants });
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black text-gray-900 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Current Stock Level</label>
                      <input 
                        type="number" 
                        value={editingProduct.variants?.[0]?.stock_quantity || ''}
                        onChange={(e) => {
                          const variants = [...(editingProduct.variants || [])];
                          variants[0] = { ...variants[0], stock_quantity: parseInt(e.target.value) };
                          setEditingProduct({ ...editingProduct, variants });
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black text-gray-900 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'media' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {editingProduct.images?.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-lg border-4 border-white">
                        <OptimizedImage src={img.path} alt="Product image" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                          <button 
                            type="button"
                            onClick={() => {
                              const images = editingProduct.images?.filter(i => i.id !== img.id);
                              setEditingProduct({ ...editingProduct, images });
                            }} 
                            className="w-10 h-10 bg-white text-red-500 rounded-xl flex items-center justify-center font-bold"
                          >
                            🗑️
                          </button>
                        </div>
                        {img.is_primary && (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-lg shadow-xl">Primary</div>
                        )}
                      </div>
                    ))}
                    <label className="aspect-square border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-300 hover:border-indigo-200 hover:text-indigo-500 cursor-pointer transition-all bg-gray-50/50 group">
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Add Asset</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              )}

              {modalTab === 'seo' && (
                <div className="space-y-10 animate-in fade-in duration-300 max-w-4xl">
                  <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 flex flex-col md:flex-row gap-8 items-center">
                    <div className="text-5xl">✨</div>
                    <div className="flex-1">
                       <h4 className="text-2xl font-black text-amber-900 tracking-tight mb-1">Gemini Semantic Optimization</h4>
                       <p className="text-amber-700 font-medium">Auto-generate search-engine meta tags based on your product manifest.</p>
                    </div>
                    <button 
                      type="button"
                      disabled={isAIGenerating}
                      onClick={handleAISEO}
                      className="px-10 py-4 bg-amber-900 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                    >
                      {isAIGenerating ? "Synthesizing..." : "Generate SEO Meta"}
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SEO Browser Title</label>
                        <span className={`text-[10px] font-bold ${editingProduct.meta_title && editingProduct.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                          {editingProduct.meta_title?.length || 0}/60
                        </span>
                      </div>
                      <input 
                        type="text" 
                        value={editingProduct.meta_title || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, meta_title: e.target.value})}
                        className={`w-full bg-gray-50 border ${errors.meta_title ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200'} rounded-2xl px-6 py-4 font-black outline-none text-indigo-600 transition-all`}
                        placeholder="The title appearing in Google search results..."
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Meta Description Snippet</label>
                        <span className={`text-[10px] font-bold ${editingProduct.meta_description && editingProduct.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                          {editingProduct.meta_description?.length || 0}/160
                        </span>
                      </div>
                      <textarea 
                        rows={4}
                        value={editingProduct.meta_description || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, meta_description: e.target.value})}
                        className={`w-full bg-gray-50 border ${errors.meta_description ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200'} rounded-[1.5rem] px-8 py-6 outline-none text-gray-800 font-medium transition-all leading-relaxed`}
                        placeholder="A concise summary designed to drive clicks..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-4 w-full sm:w-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <select 
                  value={editingProduct.status}
                  onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as any})}
                  className="bg-transparent font-black text-xs uppercase tracking-widest text-indigo-600 outline-none cursor-pointer"
                >
                  <option value="active">Active State</option>
                  <option value="draft">Draft Protocol</option>
                  <option value="archived">Archived Node</option>
                  <option value="out_of_stock">OOS Lock</option>
                </select>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="flex-1 sm:flex-none px-10 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all uppercase text-[10px] tracking-widest"
                >
                  Discard Manifest
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-14 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    editingProduct.id ? 'Commit Lifecycle Update' : 'Initialize Node'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;