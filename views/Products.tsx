import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
    status: 'live', 
    description: 'Handcrafted leather boots with premium grain leather and Goodyear welt construction.', 
    short_description: 'Handcrafted leather boots for the modern urban explorer.',
    images: [{ id: 'img-1', path: 'https://picsum.photos/400/400?random=10', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v1', sku: 'BT-001-BR-10', price: 129.99, stock_quantity: 15, attributes: { color: 'Brown', size: '10' } },
      { id: 'v2', sku: 'BT-001-BK-10', price: 129.99, stock_quantity: 8, attributes: { color: 'Black', size: '10' } }
    ]
  }
];

const INITIAL_VARIANT_STATE: ProductVariant = {
  id: '',
  sku: '',
  price: 0,
  stock_quantity: 0,
  attributes: {}
};

const INITIAL_FORM_STATE: Partial<Product> = {
  name: '',
  slug: '',
  brand: '',
  status: 'draft',
  category_name: 'Footwear',
  description: '',
  short_description: '',
  variants: [],
  images: [],
  meta_title: '',
  meta_description: ''
};

const Products: React.FC<ProductsProps> = ({ notify, removeNotify }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'general' | 'variants' | 'media' | 'seo'>('general');
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>(INITIAL_FORM_STATE);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant>(INITIAL_VARIANT_STATE);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

  // Refs for auto-scroll to validation errors
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const variantsContainerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!editingProduct.name?.trim()) errs.name = "Entity title is mandatory.";
    if (!editingProduct.slug?.trim()) errs.slug = "Path slug is required.";
    if (!editingProduct.variants || editingProduct.variants.length === 0) errs.variants = "At least one variant node must be defined.";
    return errs;
  }, [editingProduct]);

  const isProductValid = Object.keys(validationErrors).length === 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isProductValid) {
      notify?.("Validation protocol failed. Discrepancies detected in mandatory fields.", "error");
      
      // Auto-scroll to first error logic
      if (validationErrors.name || validationErrors.slug) {
        setModalTab('general');
        setTimeout(() => {
          (validationErrors.name ? nameRef : slugRef).current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (validationErrors.name ? nameRef : slugRef).current?.focus();
        }, 100);
      } else if (validationErrors.variants) {
        setModalTab('variants');
        setTimeout(() => {
          variantsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const finalProduct = {
      ...editingProduct,
      id: editingProduct.id || Math.random().toString(36).substr(2, 9),
      category_id: 'cat-1',
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
    setEditingProduct(INITIAL_FORM_STATE);
    setTouched(false);
  };

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

  const handleAddVariant = () => {
    setEditingVariant({ ...INITIAL_VARIANT_STATE, id: 'temp-' + Math.random().toString(36).substr(2, 5) });
    setEditingVariantIndex(null);
    setShowVariantForm(true);
  };

  const handleEditVariant = (variant: ProductVariant, index: number) => {
    setEditingVariant({ ...variant });
    setEditingVariantIndex(index);
    setShowVariantForm(true);
  };

  const handleSaveVariant = () => {
    if (!editingVariant.sku) {
      notify?.("SKU is mandatory for variant identification.", "error");
      return;
    }
    
    const newVariants = [...(editingProduct.variants || [])];
    if (editingVariantIndex !== null) {
      newVariants[editingVariantIndex] = editingVariant;
    } else {
      newVariants.push(editingVariant);
    }
    
    setEditingProduct({ ...editingProduct, variants: newVariants });
    setShowVariantForm(false);
  };

  const handleDeleteVariant = (index: number) => {
    const newVariants = [...(editingProduct.variants || [])];
    newVariants.splice(index, 1);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrVal, setNewAttrVal] = useState('');

  const addNewAttribute = () => {
    if (newAttrKey && newAttrVal) {
      setEditingVariant(prev => ({
        ...prev,
        attributes: { ...prev.attributes, [newAttrKey]: newAttrVal }
      }));
      setNewAttrKey('');
      setNewAttrVal('');
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Product Inventory</h2>
          <p className="text-gray-500 font-medium text-lg mt-3">Orchestrate your multi-channel catalog at scale.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(INITIAL_FORM_STATE); setShowModal(true); setModalTab('general'); setTouched(false); }}
          className="h-16 px-12 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
        >
          <span>➕</span> Initialize Product
        </button>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
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
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black border-b border-gray-100">
              <tr>
                <th className="px-12 py-10">Select</th>
                <th className="px-12 py-10">Entity Identity</th>
                <th className="px-12 py-10">Economics</th>
                <th className="px-12 py-10">Inventory</th>
                <th className="px-12 py-10 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p, index) => (
                <tr key={p.id} className="hover:bg-indigo-50/10 transition-all group">
                  <td className="px-12 py-10">
                     <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} className="w-6 h-6 rounded-lg border-gray-300 text-indigo-600" />
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden shadow-2xl border border-gray-100">
                        <OptimizedImage src={p.images[0]?.path} alt={p.name} width={100} height={100} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg tracking-tight">{p.name}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-2">{p.brand} • {p.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className="font-black text-gray-900 text-2xl tracking-tighter">${p.variants[0]?.price.toFixed(2)}</span>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`text-xl font-black ${p.variants.reduce((acc, v) => acc + v.stock_quantity, 0) < 10 ? 'text-rose-500' : 'text-gray-900'}`}>
                      {p.variants.reduce((acc, v) => acc + v.stock_quantity, 0)}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <button onClick={() => { setEditingProduct(p); setModalTab('general'); setShowModal(true); setTouched(false); }} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-[150] flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-shrink-0">
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                {editingProduct.id ? 'Refine Product' : 'Initialize Product'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditingProduct(INITIAL_FORM_STATE); }} 
                className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all active:scale-90 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex px-10 border-b border-gray-50 bg-white gap-8 overflow-x-auto scrollbar-hide flex-shrink-0">
              {[
                { id: 'general', label: 'Primary Info', icon: '📝', hasError: !!validationErrors.name || !!validationErrors.slug },
                { id: 'variants', label: 'Inventory', icon: '🏷️', hasError: !!validationErrors.variants },
                { id: 'media', label: 'Assets', icon: '📸', hasError: false },
                { id: 'seo', label: 'SEO', icon: '✨', hasError: false }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`py-6 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-4 flex items-center gap-3 whitespace-nowrap relative ${
                    modalTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.hasError && touched && <span className="absolute top-4 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-rose-200 shadow-lg"></span>}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {modalTab === 'general' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Product Master Title</label>
                      <input 
                        ref={nameRef}
                        type="text" 
                        value={editingProduct.name || ''}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = editingProduct.id ? editingProduct.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setEditingProduct({...editingProduct, name, slug});
                        }}
                        className={`w-full bg-gray-50 border ${validationErrors.name && touched ? 'border-rose-500 ring-4 ring-rose-50' : 'border-gray-200'} rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xl font-black text-gray-900 shadow-inner`}
                        placeholder="e.g. Handcrafted Leather Boots"
                      />
                      {validationErrors.name && touched && <p className="text-rose-500 text-[10px] font-black uppercase mt-3 ml-2 animate-in slide-in-from-top-1">⚠️ {validationErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">System Slug (Unique Path)</label>
                      <input 
                        ref={slugRef}
                        type="text" 
                        value={editingProduct.slug || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, slug: e.target.value})}
                        className={`w-full bg-gray-50 border ${validationErrors.slug && touched ? 'border-rose-500 ring-4 ring-rose-50' : 'border-gray-100'} rounded-2xl px-6 py-4 font-mono font-bold text-indigo-600 outline-none shadow-inner`}
                      />
                      {validationErrors.slug && touched && <p className="text-rose-500 text-[10px] font-black uppercase mt-3 ml-2 animate-in slide-in-from-top-1">⚠️ {validationErrors.slug}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Brand Identity</label>
                      <input 
                        type="text" 
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-900 outline-none shadow-inner"
                        placeholder="Lumina Premium"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Detailed Manifest (Description)</label>
                      <textarea 
                        rows={6}
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-6 font-medium text-gray-800 outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all leading-relaxed shadow-inner"
                        placeholder="Describe the engineering and soul of this product..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'variants' && (
                <div ref={variantsContainerRef} className="space-y-10 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-black text-gray-900 tracking-tighter">Variant Hierarchy</h4>
                    <button 
                      onClick={handleAddVariant}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      ➕ Create Variant
                    </button>
                  </div>

                  {validationErrors.variants && touched && <p className="text-rose-600 text-[11px] font-black uppercase text-center py-8 bg-rose-50 rounded-[2rem] border border-rose-100 shadow-sm animate-in zoom-in-95">⚠️ {validationErrors.variants}</p>}

                  <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <tr>
                          <th className="px-10 py-6">SKU / Attributes</th>
                          <th className="px-10 py-6 text-center">Price</th>
                          <th className="px-10 py-6 text-center">Stock</th>
                          <th className="px-10 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(editingProduct.variants || []).map((v, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/30 transition-all">
                            <td className="px-10 py-6">
                              <p className="font-black text-gray-900 text-sm mb-2">{v.sku}</p>
                              <div className="flex gap-2">
                                {Object.entries(v.attributes).map(([ak, av]) => (
                                  <span key={ak} className="text-[9px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{ak}: {av}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-10 py-6 text-center font-black text-gray-900 text-lg">${v.price.toFixed(2)}</td>
                            <td className="px-10 py-6 text-center">
                              <span className={`text-sm font-black ${v.stock_quantity < 5 ? 'text-rose-500' : 'text-gray-900'}`}>{v.stock_quantity} units</span>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditVariant(v, idx)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">✏️</button>
                                <button onClick={() => handleDeleteVariant(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'media' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {editingProduct.images?.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-2xl border-4 border-white">
                        <OptimizedImage src={img.path} alt="Product image" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button type="button" onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images?.filter(i => i.id !== img.id) })} className="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center font-bold">🗑️</button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-square border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-300 hover:border-indigo-200 hover:text-indigo-500 cursor-pointer transition-all bg-gray-50/50">
                      <span className="text-4xl mb-3">📸</span>
                      <span className="text-[10px] font-black uppercase">Add Asset</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              )}

              {modalTab === 'seo' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                   <div className="bg-indigo-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row gap-8 items-center">
                    <div className="text-5xl">✨</div>
                    <div className="flex-1 text-center md:text-left">
                       <h4 className="text-2xl font-black mb-2">Semantic Optimization</h4>
                       <p className="text-indigo-200 font-medium">Auto-generate search-engine metadata based on your product manifest.</p>
                    </div>
                    <button type="button" onClick={handleAISEO} className="w-full md:w-auto px-10 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black text-[10px] uppercase shadow-2xl">Generate Meta</button>
                  </div>
                  <div className="space-y-8 max-w-4xl">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">SEO Browser Title</label>
                      <input type="text" value={editingProduct.meta_title || ''} onChange={(e) => setEditingProduct({...editingProduct, meta_title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-8 py-5 font-black outline-none text-indigo-600 shadow-inner transition-all" />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Meta Description Snippet</label>
                      <textarea rows={4} value={editingProduct.meta_description || ''} onChange={(e) => setEditingProduct({...editingProduct, meta_description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-[1.5rem] px-8 py-6 outline-none text-gray-800 font-medium transition-all shadow-inner leading-relaxed" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-6 flex-shrink-0">
               <div className="flex items-center gap-4 w-full sm:w-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <select value={editingProduct.status} onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as any})} className="bg-transparent font-black text-[10px] uppercase tracking-[0.2em] text-indigo-600 outline-none cursor-pointer">
                  <option value="live">🟢 Live Storefront</option>
                  <option value="draft">🟡 Draft Mode</option>
                  <option value="out_of_stock">🔴 Out of Stock</option>
                </select>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button onClick={() => { setShowModal(false); setEditingProduct(INITIAL_FORM_STATE); }} className="flex-1 sm:flex-none px-10 py-5 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all uppercase text-[10px] tracking-widest">Discard</button>
                <button 
                  onClick={handleSave}
                  disabled={isSubmitting || (touched && !isProductValid)}
                  className={`
                    flex-1 sm:flex-none px-16 py-5 rounded-[1.5rem] font-black transition-all active:scale-95 flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.3em]
                    ${(!isProductValid && touched) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100'}
                  `}
                >
                  {isSubmitting ? <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : (editingProduct.id ? 'Commit Update' : 'Initialize Node')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVariantForm && (
        <div className="fixed inset-0 bg-gray-900/90 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 p-10 space-y-8">
            <h5 className="text-2xl font-black text-gray-900 tracking-tighter">Variant Metadata</h5>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">SKU Identifier</label>
                <input type="text" value={editingVariant.sku} onChange={e => setEditingVariant({ ...editingVariant, sku: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-mono font-bold text-indigo-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Price ($)</label>
                  <input type="number" value={editingVariant.price || ''} onChange={e => setEditingVariant({ ...editingVariant, price: parseFloat(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stock Units</label>
                  <input type="number" value={editingVariant.stock_quantity || ''} onChange={e => setEditingVariant({ ...editingVariant, stock_quantity: parseInt(e.target.value) })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-black" />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowVariantForm(false)} className="flex-1 py-4 font-black text-gray-400 uppercase text-[10px]">Cancel</button>
              <button onClick={handleSaveVariant} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-indigo-100">Apply Node</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;