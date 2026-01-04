
import React, { useState } from 'react';
import { Category } from '../types';
import { generateSEOTags } from '../services/geminiService';

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    is_active: true,
    product_count: 145,
    icon: '⚡',
    description: 'Latest gadgets and tech equipment including smartphones, laptops, and smart home devices.',
    image_path: 'https://picsum.photos/400/300?random=20',
    meta_title: 'Shop Latest Electronics & Gadgets',
    meta_description: 'Discover the best in tech with our curated selection of high-performance electronics.',
    children: [
      { id: '11', parent_id: '1', name: 'Smartphones', slug: 'smartphones', is_active: true, product_count: 82 },
      { id: '12', parent_id: '1', name: 'Laptops', slug: 'laptops', is_active: true, product_count: 63 },
    ]
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    is_active: true,
    product_count: 320,
    icon: '👕',
    description: 'Trendy clothing, luxury accessories, and premium footwear for all styles.',
    image_path: 'https://picsum.photos/400/300?random=21',
    children: [
      { id: '21', parent_id: '2', name: 'Menswear', slug: 'mens', is_active: true, product_count: 180 },
      { id: '22', parent_id: '2', name: 'Womenswear', slug: 'womens', is_active: true, product_count: 140 },
    ]
  },
  {
    id: '3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    is_active: false,
    product_count: 0,
    icon: '🏠',
    description: 'Essentials for your living space, including decor, furniture, and kitchenware.',
  }
];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'media' | 'seo'>('info');
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  const handleAIDesign = async () => {
    if (!editingCategory?.name) return alert('Enter a category name first');
    setIsGeneratingSEO(true);
    const seo = await generateSEOTags(editingCategory.name, editingCategory.description || 'General category');
    if (seo) {
      setEditingCategory(prev => ({
        ...prev,
        meta_title: seo.title,
        meta_description: seo.metaDescription
      }));
    }
    setIsGeneratingSEO(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? Sub-categories may be orphaned.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const renderCategoryRow = (cat: Category, depth: number = 0) => (
    <React.Fragment key={cat.id}>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 group">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
            {depth > 0 && <span className="text-gray-300 font-mono">└─</span>}
            <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl text-xl shadow-sm border border-indigo-100">
              {cat.icon || '📁'}
            </span>
            <div>
              <p className="font-bold text-gray-900">{cat.name}</p>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">/{cat.slug}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 hidden md:table-cell">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">{cat.product_count}</span>
            <span className="text-xs text-gray-400">items</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            cat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 shadow-sm'
          }`}>
            {cat.is_active ? 'Active' : 'Disabled'}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => { setEditingCategory(cat); setShowModal(true); setModalTab('info'); }}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit"
            >
              ✏️
            </button>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </td>
      </tr>
      {cat.children?.map(child => renderCategoryRow(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Category Hierarchy</h2>
          <p className="text-sm text-gray-500">Define your store architecture and semantic SEO paths.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory({ is_active: true, product_count: 0 }); setShowModal(true); setModalTab('info'); }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95"
        >
          <span>➕</span> New Node
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Node Identity</th>
                <th className="px-6 py-5 hidden md:table-cell">Inventory Load</th>
                <th className="px-6 py-5">Visibility</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => renderCategoryRow(cat))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div className="p-20 text-center text-gray-400">
            <p className="text-5xl mb-4">🌳</p>
            <p className="font-black">The catalog tree is empty.</p>
            <p className="text-sm">Initialize your first root category to start building your store.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Head */}
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
                  {editingCategory?.id ? 'Edit Taxonomy Node' : 'Initialize New Node'}
                </h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">/{editingCategory?.slug || 'new-slug'}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all active:scale-90"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex px-8 border-b border-gray-50 gap-6 flex-shrink-0">
              {[
                { id: 'info', label: 'Primary Info', icon: '📝' },
                { id: 'media', label: 'Media & Cover', icon: '🖼️' },
                { id: 'seo', label: 'SEO Engine', icon: '✨' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                    modalTab === tab.id 
                      ? 'text-indigo-600 border-indigo-600' 
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {modalTab === 'info' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Category Display Name</label>
                      <input 
                        type="text" 
                        value={editingCategory?.name || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        placeholder="e.g. Performance Accessories"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg font-black text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Icon Glyph</label>
                      <input 
                        type="text" 
                        value={editingCategory?.icon || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                        placeholder="e.g. 🎧"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none text-gray-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Parent Placement</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none appearance-none cursor-pointer text-gray-900 font-bold"
                        value={editingCategory?.parent_id || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, parent_id: e.target.value})}
                      >
                        <option value="">Root Level (Top Tier)</option>
                        {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Catalog Narrative</label>
                      <textarea 
                        rows={4}
                        value={editingCategory?.description || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                        placeholder="Provide a detailed description of what users will find in this category..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900 leading-relaxed font-medium"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'media' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Category Cover Image</label>
                    <div className="relative group overflow-hidden rounded-[2.5rem] border-4 border-dashed border-gray-100 aspect-video flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer">
                      {editingCategory?.image_path ? (
                        <>
                          <img src={editingCategory.image_path} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black shadow-xl">Change Artwork</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-8">
                          <span className="text-5xl mb-4 block grayscale group-hover:grayscale-0 transition-all duration-700">🖼️</span>
                          <p className="text-gray-900 font-black text-xl mb-1">Upload Narrative Artwork</p>
                          <p className="text-gray-400 text-sm font-medium">1200x630px recommended for social share</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'seo' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-indigo-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-indigo-100">
                    <div className="flex-1">
                      <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                        <span>✨</span> Semantic Optimization
                      </h4>
                      <p className="text-indigo-200 text-xs font-medium leading-relaxed">Gemini will analyze your node name and narrative to generate search-optimized metadata automatically.</p>
                    </div>
                    <button 
                      onClick={handleAIDesign}
                      disabled={isGeneratingSEO}
                      className="w-full md:w-auto bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                    >
                      {isGeneratingSEO ? (
                        <span className="w-5 h-5 border-3 border-indigo-200 border-t-indigo-900 rounded-full animate-spin"></span>
                      ) : 'Generate Metadata'}
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">SEO Browser Title</label>
                      <input 
                        type="text" 
                        value={editingCategory?.meta_title || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, meta_title: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black outline-none text-indigo-600"
                        placeholder="Search engines will show this title..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Semantic Snippet (Meta Desc)</label>
                      <textarea 
                        rows={3}
                        value={editingCategory?.meta_description || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, meta_description: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none text-gray-900 font-medium"
                        placeholder="Summarize the category for search results..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-4 w-full sm:w-auto p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <input 
                  type="checkbox" 
                  id="modal_is_active"
                  checked={editingCategory?.is_active}
                  onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                  className="w-6 h-6 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 cursor-pointer" 
                />
                <label htmlFor="modal_is_active" className="cursor-pointer">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Storefront Visibility</span>
                </label>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 sm:flex-none px-8 py-3 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all"
                >
                  Discard
                </button>
                <button 
                  className="flex-1 sm:flex-none px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Save Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
