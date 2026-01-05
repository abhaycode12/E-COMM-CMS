
import React, { useState, useCallback, useMemo } from 'react';
import { Category } from '../types';
import { generateSEOTags } from '../services/geminiService';
import OptimizedImage from '../components/OptimizedImage';

interface CategoriesProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
  removeNotify?: (id: string) => void;
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    is_active: true,
    product_count: 145,
    icon: '⚡',
    sort_order: 0,
    description: 'Latest gadgets and tech equipment including smartphones, laptops, and smart home devices.',
    image_path: 'https://picsum.photos/400/300?random=20',
    meta_title: 'Shop Latest Electronics & Gadgets',
    meta_description: 'Discover the best in tech with our curated selection of high-performance electronics.',
    children: [
      { id: '11', parent_id: '1', name: 'Smartphones', slug: 'smartphones', is_active: true, product_count: 82, sort_order: 0 },
      { id: '12', parent_id: '1', name: 'Laptops', slug: 'laptops', is_active: true, product_count: 63, sort_order: 1 },
    ]
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    is_active: true,
    product_count: 320,
    icon: '👕',
    sort_order: 1,
    description: 'Trendy clothing, luxury accessories, and premium footwear for all styles.',
    image_path: 'https://picsum.photos/400/300?random=21',
    children: [
      { id: '21', parent_id: '2', name: 'Menswear', slug: 'mens', is_active: true, product_count: 180, sort_order: 0 },
      { id: '22', parent_id: '2', name: 'Womenswear', slug: 'womens', is_active: true, product_count: 140, sort_order: 1 },
    ]
  },
  {
    id: '3',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    is_active: false,
    product_count: 0,
    icon: '🏠',
    sort_order: 2,
    description: 'Essentials for your living space, including decor, furniture, and kitchenware.',
  }
];

const Categories: React.FC<CategoriesProps> = ({ notify, removeNotify }) => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'media' | 'seo'>('info');
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Category | null>(null);

  // SEO Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSEO = useCallback((cat: Partial<Category>) => {
    const newErrors: Record<string, string> = {};
    if (cat.meta_title && cat.meta_title.length > 60) {
      newErrors.meta_title = "Meta title must be under 60 characters.";
    }
    if (cat.meta_description && cat.meta_description.length > 160) {
      newErrors.meta_description = "Meta description must be under 160 characters.";
    }
    if (cat.slug && !/^[a-z0-9-]+$/.test(cat.slug)) {
      newErrors.slug = "Slug must be lowercase, numbers, and hyphens only.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleAIDesign = async () => {
    if (!editingCategory?.name) {
      notify?.('Identify a category name first to trigger SEO analysis.', 'error');
      return;
    }
    setIsGeneratingSEO(true);
    const seo = await generateSEOTags(editingCategory.name, editingCategory.description || 'General category');
    if (seo) {
      setEditingCategory(prev => ({
        ...prev,
        meta_title: seo.title.slice(0, 60),
        meta_description: seo.metaDescription.slice(0, 160)
      }));
      notify?.('Metadata synthesized by Gemini.', 'success');
    }
    setIsGeneratingSEO(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? Sub-categories may be orphaned.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      notify?.('Taxonomy node purged.', 'info');
    }
  };

  const handleToggleStatus = (id: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) return { ...c, is_active: !c.is_active };
      if (c.children) {
        return { ...c, children: c.children.map(child => child.id === id ? { ...child, is_active: !child.is_active } : child) };
      }
      return c;
    }));
    notify?.('Visibility status synchronized.', 'success');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingCategory(prev => ({ ...prev, image_path: reader.result as string }));
        notify?.('Image staged for upload.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetCategory.id) return;

    const newCategories = [...categories];
    const draggedIdx = newCategories.findIndex(c => c.id === draggedItem.id);
    const targetIdx = newCategories.findIndex(c => c.id === targetCategory.id);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      newCategories.splice(draggedIdx, 1);
      newCategories.splice(targetIdx, 0, draggedItem);
      
      // Update sort orders
      const updated = newCategories.map((c, i) => ({ ...c, sort_order: i }));
      setCategories(updated);
      notify?.('Hierarchy reordered successfully.', 'success');
    }
    setDraggedItem(null);
  };

  const handleSave = () => {
    if (!editingCategory) return;
    if (!validateSEO(editingCategory)) {
      notify?.('Please correct validation errors before saving.', 'error');
      return;
    }

    const loadId = notify?.('Synchronizing taxonomy update...', 'loading');
    setTimeout(() => {
      if (loadId && removeNotify) removeNotify(loadId);
      
      if (editingCategory.id) {
        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...editingCategory } as Category : c));
      } else {
        const newCat: Category = {
          ...editingCategory,
          id: Math.random().toString(36).substr(2, 9),
          product_count: 0,
          sort_order: categories.length,
          is_active: editingCategory.is_active ?? true,
        } as Category;
        setCategories(prev => [...prev, newCat]);
      }
      
      notify?.('Category lifecycle update successful.', 'success');
      setShowModal(false);
    }, 800);
  };

  const renderCategoryRow = (cat: Category, depth: number = 0) => (
    <React.Fragment key={cat.id}>
      <tr 
        draggable={depth === 0}
        onDragStart={(e) => depth === 0 && handleDragStart(e, cat)}
        onDragOver={handleDragOver}
        onDrop={(e) => depth === 0 && handleDrop(e, cat)}
        className={`hover:bg-gray-50 transition-colors border-b border-gray-100 group ${depth === 0 ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
            {depth > 0 && <span className="text-gray-300 font-mono">└─</span>}
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl text-xl shadow-sm border border-indigo-100 overflow-hidden relative">
               {cat.image_path ? (
                 <img src={cat.image_path} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span>{cat.icon || '📁'}</span>
               )}
            </div>
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
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleStatus(cat.id); }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${cat.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
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
      {cat.children?.sort((a,b) => a.sort_order - b.sort_order).map(child => renderCategoryRow(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Category Hierarchy</h2>
          <p className="text-sm text-gray-500">Define your store architecture and semantic SEO paths. Drag root items to reorder.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory({ is_active: true, product_count: 0, sort_order: categories.length, name: '', slug: '' }); setShowModal(true); setModalTab('info'); }}
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
              {categories.sort((a,b) => a.sort_order - b.sort_order).map(cat => renderCategoryRow(cat))}
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
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto">
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
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = editingCategory?.id ? editingCategory.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          setEditingCategory({...editingCategory, name, slug});
                        }}
                        placeholder="e.g. Performance Accessories"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg font-black text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Slug (Unique Path)</label>
                      <input 
                        type="text" 
                        value={editingCategory?.slug || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                        className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 outline-none text-gray-900 font-mono ${errors.slug ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200'}`}
                      />
                      {errors.slug && <p className="text-red-500 text-[9px] mt-1 font-bold">{errors.slug}</p>}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <label className="relative group overflow-hidden rounded-[2.5rem] border-4 border-dashed border-gray-100 aspect-video flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer">
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
                            <p className="text-gray-400 text-sm font-medium">JPG, PNG, WebP supported</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase mb-2">Live Preview Overlay</h5>
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                             <OptimizedImage src={editingCategory?.image_path} alt="Preview" />
                             <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                                <p className="text-white font-black text-lg tracking-tight leading-none">{editingCategory?.name || 'Category Name'}</p>
                                <p className="text-white/60 text-[9px] font-bold uppercase mt-1">Storefront Preview</p>
                             </div>
                          </div>
                        </div>
                        {editingCategory?.image_path && (
                          <button 
                            onClick={() => setEditingCategory({...editingCategory, image_path: undefined})}
                            className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                          >
                            Remove Asset
                          </button>
                        )}
                      </div>
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
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SEO Browser Title</label>
                        <span className={`text-[10px] font-bold ${editingCategory?.meta_title && editingCategory.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                          {editingCategory?.meta_title?.length || 0}/60
                        </span>
                      </div>
                      <input 
                        type="text" 
                        value={editingCategory?.meta_title || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingCategory({...editingCategory, meta_title: val});
                          validateSEO({...editingCategory, meta_title: val});
                        }}
                        className={`w-full bg-gray-50 border rounded-2xl px-5 py-4 font-black outline-none text-indigo-600 ${errors.meta_title ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200'}`}
                        placeholder="Search engines will show this title..."
                      />
                      {errors.meta_title && <p className="text-red-500 text-[9px] mt-1 font-bold">{errors.meta_title}</p>}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Semantic Snippet (Meta Desc)</label>
                        <span className={`text-[10px] font-bold ${editingCategory?.meta_description && editingCategory.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                          {editingCategory?.meta_description?.length || 0}/160
                        </span>
                      </div>
                      <textarea 
                        rows={3}
                        value={editingCategory?.meta_description || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingCategory({...editingCategory, meta_description: val});
                          validateSEO({...editingCategory, meta_description: val});
                        }}
                        className={`w-full bg-gray-50 border rounded-2xl px-6 py-4 outline-none text-gray-900 font-medium ${errors.meta_description ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-200'}`}
                        placeholder="Summarize the category for search results..."
                      ></textarea>
                      {errors.meta_description && <p className="text-red-500 text-[9px] mt-1 font-bold">{errors.meta_description}</p>}
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
                  onClick={handleSave}
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
