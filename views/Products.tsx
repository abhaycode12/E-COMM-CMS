
import React, { useState } from 'react';
import { Product, ProductVariant, ProductImage } from '../types';
import { generateProductDescription, generateSEOTags } from '../services/geminiService';

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
    hsn_code: '6403',
    gst_percentage: 12,
    images: [{ id: 'img-1', path: 'https://picsum.photos/200/200?random=10', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v1', sku: 'BT-001-BR-10', price: 129.99, stock_quantity: 15, attributes: { color: 'Brown', size: '10' } },
      { id: 'v2', sku: 'BT-001-BK-10', price: 129.99, stock_quantity: 30, attributes: { color: 'Black', size: '10' } }
    ],
    meta_title: 'Premium Leather Boots - Best Quality',
    meta_description: 'Buy premium handcrafted leather boots at LuminaCommerce.'
  },
  { 
    id: '2', 
    name: 'Cotton Crewneck Tee', 
    slug: 'cotton-crewneck-tee',
    category_id: 'cat-2',
    category_name: 'Apparel',
    brand: 'DailyEssentials',
    status: 'active', 
    description: '100% organic cotton...', 
    hsn_code: '6109',
    gst_percentage: 5,
    images: [{ id: 'img-2', path: 'https://picsum.photos/200/200?random=11', is_primary: true, sort_order: 0 }],
    variants: [
      { id: 'v3', sku: 'TS-042-W-L', price: 24.50, stock_quantity: 120, attributes: { color: 'White', size: 'L' } }
    ]
  },
];

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'inventory' | 'media' | 'seo'>('general');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Status'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => `${p.id},"${p.name}","${p.variants[0]?.sku}",${p.variants[0]?.price},${p.variants.reduce((acc, v) => acc + v.stock_quantity, 0)},${p.status}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lumina_products_export.csv';
    link.click();
  };

  const handleAIDescription = async () => {
    if (!editingProduct?.name) return alert('Enter a product name first');
    setIsGenerating(true);
    const result = await generateProductDescription(editingProduct.name, [editingProduct.brand || '', 'Premium', 'Eco-friendly']);
    setEditingProduct(prev => ({ ...prev, description: result }));
    setIsGenerating(false);
  };

  const handleAISEO = async () => {
    if (!editingProduct?.name) return alert('Enter a product name first');
    setIsGenerating(true);
    const result = await generateSEOTags(editingProduct.name, editingProduct.description || '');
    setEditingProduct(prev => ({ 
      ...prev, 
      meta_title: result.title, 
      meta_description: result.metaDescription 
    }));
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Catalog Management</h2>
          <p className="text-gray-500 mt-1">Manage {products.length} products and their associated variants.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
          <button 
            onClick={() => { setEditingProduct({ status: 'draft', variants: [], images: [] }); setShowModal(true); }}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100 active:scale-95"
          >
            <span>➕</span> Add Product
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, SKU or brand..." 
              className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900"
            />
          </div>
          <select className="bg-white border border-gray-200 rounded-2xl px-6 py-3 outline-none font-bold text-gray-900">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Out of Stock</option>
          </select>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
            <tr>
              <th className="px-8 py-5">Product Identity</th>
              <th className="px-8 py-5">Primary SKU</th>
              <th className="px-8 py-5">Aggregate Stock</th>
              <th className="px-8 py-5">Starting Price</th>
              <th className="px-8 py-5">Visibility</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => {
              const totalStock = product.variants.reduce((acc, v) => acc + v.stock_quantity, 0);
              const minPrice = Math.min(...product.variants.map(v => v.price));
              return (
                <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="relative group/img">
                        <img 
                          src={product.images[0]?.path} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm transition-transform group-hover/img:scale-105" 
                          alt="" 
                        />
                        {product.images.length > 1 && (
                          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                            +{product.images.length - 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 leading-tight mb-1">{product.name}</p>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{product.category_name || 'Uncategorized'} • {product.brand || 'No Brand'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-mono font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                      {product.variants[0]?.sku || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-sm font-black ${totalStock === 0 ? 'text-red-500' : 'text-gray-800'}`}>
                        {totalStock} units
                      </span>
                      <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${totalStock < 10 ? 'bg-red-500' : totalStock < 50 ? 'bg-amber-500' : 'bg-green-500'}`} 
                          style={{width: `${Math.min((totalStock / 200) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 text-lg">${minPrice.toFixed(2)}</span>
                      {product.variants.length > 1 && <span className="text-[10px] text-gray-400 font-bold uppercase">From {product.variants.length} options</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' : 
                      product.status === 'draft' ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => { setEditingProduct(product); setShowModal(true); }}
                        className="p-3 text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all"
                      >
                        ✏️
                      </button>
                      <button className="p-3 text-red-500 hover:bg-white hover:shadow-md rounded-2xl transition-all">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                  {editingProduct?.id ? 'Edit Product Catalog' : 'Initialize New Product'}
                </h3>
                <p className="text-gray-400 font-medium mt-1">Populate core attributes, variants, and SEO data.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-3xl text-gray-400 hover:text-gray-900 shadow-sm transition-all active:scale-90"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation */}
            <div className="px-10 py-2 border-b border-gray-100 flex gap-8">
              {[
                { id: 'general', label: 'Identity & Info' },
                { id: 'pricing', label: 'Pricing & Tax' },
                { id: 'inventory', label: 'Inventory & Variants' },
                { id: 'media', label: 'Media Library' },
                { id: 'seo', label: 'SEO Engine' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 text-sm font-black transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'text-indigo-600 border-indigo-600' 
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              {activeTab === 'general' && (
                <div className="grid grid-cols-2 gap-10">
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Master Product Name</label>
                    <input 
                      type="text" 
                      value={editingProduct?.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="e.g. Aeron Ergonomic Chair - 2025 Edition"
                      className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-5 text-xl font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Product Slug (URL)</label>
                    <input 
                      type="text" 
                      value={editingProduct?.slug || ''}
                      className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 text-sm font-mono text-gray-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Manufacturer / Brand</label>
                    <input 
                      type="text" 
                      value={editingProduct?.brand || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900"
                    />
                  </div>
                  <div className="col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Compelling Narrative</label>
                      <button 
                        onClick={handleAIDescription}
                        disabled={isGenerating}
                        className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isGenerating ? 'Writing...' : '✨ Write with Gemini'}
                      </button>
                    </div>
                    <textarea 
                      rows={6}
                      value={editingProduct?.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-8 py-6 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900 leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="grid grid-cols-2 gap-10">
                  <div className="col-span-2 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center gap-6">
                    <span className="text-4xl">🧾</span>
                    <div>
                      <h4 className="font-black text-amber-900">Tax Compliance Config</h4>
                      <p className="text-amber-700 text-sm">Configure HSN/SAC codes and GST/VAT percentages for this item.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">HSN / SAC Code</label>
                    <input 
                      type="text" 
                      value={editingProduct?.hsn_code || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, hsn_code: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">GST Percentage (%)</label>
                    <select 
                      value={editingProduct?.gst_percentage || 18}
                      onChange={(e) => setEditingProduct({ ...editingProduct, gst_percentage: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold outline-none appearance-none text-gray-900"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5% (Essential)</option>
                      <option value={12}>12% (Standard Low)</option>
                      <option value={18}>18% (Standard High)</option>
                      <option value={28}>28% (Luxury)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xl font-black text-gray-900">SKU Variants Matrix</h4>
                    <button className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                      + Generate New Matrix
                    </button>
                  </div>
                  <div className="border border-gray-100 rounded-3xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black">
                        <tr>
                          <th className="px-6 py-4 text-left">Configuration</th>
                          <th className="px-6 py-4 text-left">SKU Mapping</th>
                          <th className="px-6 py-4 text-left">Base Price</th>
                          <th className="px-6 py-4 text-left">On Hand</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {editingProduct?.variants?.map((v, idx) => (
                          <tr key={idx} className="group">
                            <td className="px-6 py-5">
                              <div className="flex gap-2">
                                {Object.entries(v.attributes).map(([k, val]) => (
                                  <span key={k} className="text-[10px] font-black px-2 py-1 bg-white border border-gray-100 rounded-md shadow-sm">
                                    {val}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-5 font-mono text-xs font-bold text-gray-500">{v.sku}</td>
                            <td className="px-6 py-5 font-black text-gray-900">${v.price}</td>
                            <td className="px-6 py-5">
                              <input 
                                type="number" 
                                value={v.stock_quantity}
                                className="w-20 bg-gray-50 border border-transparent rounded-lg px-2 py-1 font-bold focus:bg-white focus:border-indigo-100 text-gray-900"
                              />
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button className="text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-4 p-12 border-4 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 group hover:border-indigo-100 transition-colors cursor-pointer">
                    <span className="text-6xl grayscale group-hover:grayscale-0 transition-all duration-500">📸</span>
                    <div className="text-center">
                      <p className="text-xl font-black text-gray-900">Drop High-Res Assets</p>
                      <p className="text-gray-400 font-medium">PNG, WEBP or JPG (Max 5MB each)</p>
                    </div>
                  </div>
                  {editingProduct?.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-[2rem] overflow-hidden border border-gray-100 group">
                      <img src={img.path} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button className="p-3 bg-white rounded-2xl text-lg hover:scale-110 transition-transform">⭐</button>
                        <button className="p-3 bg-white text-red-500 rounded-2xl text-lg hover:scale-110 transition-transform">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-10">
                  <div className="bg-indigo-900 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl shadow-indigo-200">
                    <div className="max-w-md">
                      <h4 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <span className="text-3xl">✨</span> Semantic SEO Engine
                      </h4>
                      <p className="text-indigo-200 text-sm font-medium">Use AI to generate search engine metadata that converts. Gemini analyzes your description to build the perfect meta profile.</p>
                    </div>
                    <button 
                      onClick={handleAISEO}
                      disabled={isGenerating}
                      className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isGenerating ? 'Analyzing...' : 'Execute Analysis'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-10">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Google Search Preview Title</label>
                      <input 
                        type="text" 
                        value={editingProduct?.meta_title || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-bold outline-none text-indigo-600 text-lg"
                        placeholder="Click Execute Analysis to generate..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Search Result Snippet</label>
                      <textarea 
                        rows={3}
                        value={editingProduct?.meta_description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_description: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 font-medium outline-none text-gray-900"
                        placeholder="Optimized meta description goes here..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Status:</label>
                <select 
                  value={editingProduct?.status}
                  onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-sm outline-none text-gray-900"
                >
                  <option value="draft">📁 Draft Mode</option>
                  <option value="active">🟢 Live on Store</option>
                  <option value="archived">📦 Archived</option>
                  <option value="out_of_stock">🔴 Out of Stock</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-10 py-3 rounded-2xl font-black text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  Discard Draft
                </button>
                <button 
                  className="px-14 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
                >
                  Commit Changes
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
