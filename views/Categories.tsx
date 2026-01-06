import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  }
];

const Categories: React.FC<CategoriesProps> = ({ notify, removeNotify }) => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'media' | 'seo'>('info');
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Category | null>(null);
  const [touched, setTouched] = useState(false);
  
  // Input refs for auto-scrolling
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const metaTitleRef = useRef<HTMLInputElement>(null);
  const metaDescRef = useRef<HTMLTextAreaElement>(null);

  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!editingCategory) return errs;
    if (!editingCategory.name?.trim()) errs.name = "Category title is required.";
    if (!editingCategory.slug?.trim()) errs.slug = "Taxonomy slug path is required.";
    else if (!/^[a-z0-9-]+$/.test(editingCategory.slug)) {
      errs.slug = "Slug must contain only lowercase, numbers, and hyphens.";
    }
    if (editingCategory.meta_title && editingCategory.meta_title.length > 60) {
      errs.meta_title = "SEO title exceeds character threshold (60).";
    }
    if (editingCategory.meta_description && editingCategory.meta_description.length > 160) {
      errs.meta_description = "SEO snippet exceeds character threshold (160).";
    }
    return errs;
  }, [editingCategory]);

  const isCategoryValid = Object.keys(validationErrors).length === 0;

  const handleSave = () => {
    setTouched(true);
    if (!editingCategory) return;

    if (!isCategoryValid) {
      notify?.('Correct validation discrepancies before node synchronization.', 'error');
      
      // Auto-scroll logic
      if (validationErrors.name || validationErrors.slug) {
        setModalTab('info');
        setTimeout(() => {
          (validationErrors.name ? nameRef : slugRef).current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (validationErrors.name ? nameRef : slugRef).current?.focus();
        }, 100);
      } else if (validationErrors.meta_title || validationErrors.meta_description) {
        setModalTab('seo');
        setTimeout(() => {
          (validationErrors.meta_title ? metaTitleRef : metaDescRef).current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (validationErrors.meta_title ? metaTitleRef : metaDescRef).current?.focus();
        }, 100);
      }
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
      setTouched(false);
    }, 800);
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingCategory(prev => ({ ...prev, image_path: reader.result as string }));
      notify?.('Asset optimized and staged.', 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Category Hierarchy</h2>
          <p className="text-lg text-gray-500 font-medium mt-4">Define store architecture and SEO paths.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory({ is_active: true, name: '', slug: '' }); setTouched(false); setShowModal(true); setModalTab('info'); }}
          className="bg-indigo-600 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 text-sm uppercase tracking-widest"
        >
          <span>➕</span> New Node
        </button>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-100">
              <tr>
                <th className="px-8 py-8">Node Identity</th>
                <th className="px-8 py-8">Inventory</th>
                <th className="px-8 py-8">Visibility</th>
                <th className="px-8 py-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl text-xl">
                        {cat.image_path ? <OptimizedImage src={cat.image_path} alt={cat.name} width={80} height={80} /> : '📁'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-base leading-tight">{cat.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-700">{cat.product_count} items</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`w-3 h-3 rounded-full inline-block ${cat.is_active ? 'bg-indigo-600' : 'bg-gray-200'}`}></span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => { setEditingCategory(cat); setTouched(false); setShowModal(true); setModalTab('info'); }} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-xl z-[150] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            <div className="p-10 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center flex-shrink-0">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                {editingCategory?.id ? 'Edit Taxonomy Node' : 'Initialize New Node'}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all active:scale-90 text-xl">✕</button>
            </div>

            <div className="flex px-10 border-b border-gray-50 bg-white gap-8 overflow-x-auto scrollbar-hide flex-shrink-0">
              {[
                { id: 'info', label: 'Primary Info', icon: '📝', hasError: !!validationErrors.name || !!validationErrors.slug },
                { id: 'media', label: 'Cover Asset', icon: '🖼️', hasError: false },
                { id: 'seo', label: 'SEO Logic', icon: '✨', hasError: !!validationErrors.meta_title || !!validationErrors.meta_description }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-4 flex items-center gap-3 whitespace-nowrap relative ${
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
              {modalTab === 'info' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Category Title</label>
                      <input 
                        ref={nameRef}
                        type="text" 
                        value={editingCategory?.name || ''}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = editingCategory?.id ? editingCategory.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setEditingCategory({...editingCategory, name, slug});
                        }}
                        className={`w-full bg-gray-50 border ${validationErrors.name && touched ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-500'} rounded-2xl px-6 py-5 outline-none transition-all text-2xl font-black text-gray-900 shadow-inner`}
                      />
                      {validationErrors.name && touched && <p className="text-red-500 text-[10px] font-black uppercase ml-1 mt-3 animate-in slide-in-from-top-1">⚠️ {validationErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Unique Slug Path</label>
                      <input 
                        ref={slugRef}
                        type="text" 
                        value={editingCategory?.slug || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                        className={`w-full bg-gray-50 border rounded-2xl px-6 py-4 outline-none text-gray-900 font-mono font-bold shadow-inner transition-all ${validationErrors.slug && touched ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-indigo-500'}`}
                      />
                      {validationErrors.slug && touched && <p className="text-red-500 text-[10px] font-black uppercase ml-1 mt-3 animate-in slide-in-from-top-1">⚠️ {validationErrors.slug}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Hierarchy Placement</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer text-gray-900 font-bold shadow-inner"
                        value={editingCategory?.parent_id || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, parent_id: e.target.value})}
                      >
                        <option value="">Root Hierarchy</option>
                        {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'media' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Asset</label>
                       <div className="relative group overflow-hidden rounded-[2.5rem] border-4 border-dashed border-gray-100 aspect-video flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-indigo-200 transition-all shadow-inner">
                        {editingCategory?.image_path ? (
                          <>
                            <OptimizedImage src={editingCategory.image_path} alt={editingCategory.name || 'Category cover'} aspectRatio="aspect-video" />
                            <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4 transition-opacity backdrop-blur-sm">
                              <label className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black shadow-2xl text-xs uppercase tracking-widest cursor-pointer active:scale-95 transition-transform">
                                Replace Asset
                                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageUpload} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="text-center p-8 group w-full h-full flex flex-col items-center justify-center cursor-pointer">
                            <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform duration-500">📸</span>
                            <p className="text-gray-900 font-black text-lg mb-1">Staging Area</p>
                            <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageUpload} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'seo' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="bg-indigo-900 p-8 sm:p-10 rounded-[2.5rem] text-white flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl">
                    <div className="flex-1 text-center lg:text-left">
                      <h4 className="text-2xl font-black mb-2 flex items-center justify-center lg:justify-start gap-3">
                        <span className="text-3xl">✨</span> Gemini SEO Core
                      </h4>
                      <p className="text-indigo-200 text-sm font-medium leading-relaxed max-w-md mx-auto lg:mx-0">Synthesize optimized metadata nodes.</p>
                    </div>
                    <button onClick={handleAIDesign} disabled={isGeneratingSEO} className="w-full lg:w-auto bg-white text-indigo-900 px-10 py-5 rounded-[1.5rem] font-black hover:bg-indigo-50 transition-all shadow-2xl disabled:opacity-50">
                      {isGeneratingSEO ? <span className="w-5 h-5 border-3 border-indigo-200 border-t-indigo-900 rounded-full animate-spin"></span> : 'Synthesize Meta'}
                    </button>
                  </div>
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div>
                      <div className="flex justify-between items-center mb-4 px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SERP Browser Title</label>
                        <span className={`text-[10px] font-black ${editingCategory?.meta_title && editingCategory.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                          {editingCategory?.meta_title?.length || 0} / 60
                        </span>
                      </div>
                      <input 
                        ref={metaTitleRef}
                        type="text" 
                        value={editingCategory?.meta_title || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, meta_title: e.target.value})}
                        className={`w-full bg-gray-50 border rounded-2xl px-6 py-4 font-black outline-none text-indigo-600 shadow-inner transition-all text-lg ${validationErrors.meta_title && touched ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-indigo-500'}`}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4 px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Crawler Snippet</label>
                        <span className={`text-[10px] font-black ${editingCategory?.meta_description && editingCategory.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                          {editingCategory?.meta_description?.length || 0} / 160
                        </span>
                      </div>
                      <textarea 
                        ref={metaDescRef}
                        rows={4}
                        value={editingCategory?.meta_description || ''}
                        onChange={(e) => setEditingCategory({...editingCategory, meta_description: e.target.value})}
                        className={`w-full bg-gray-50 border rounded-[1.5rem] px-8 py-6 outline-none text-gray-900 font-medium shadow-inner transition-all leading-relaxed ${validationErrors.meta_description && touched ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-100 focus:border-indigo-500'}`}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-4 w-full sm:w-auto p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <input type="checkbox" id="modal_is_active" checked={editingCategory?.is_active} onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})} className="w-7 h-7 text-indigo-600 border-gray-300 rounded-xl" />
                <label htmlFor="modal_is_active" className="cursor-pointer text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Visibility Enabled</label>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button onClick={() => setShowModal(false)} className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 transition-all text-xs uppercase tracking-widest">Discard</button>
                <button 
                  onClick={handleSave} 
                  disabled={touched && !isCategoryValid} 
                  className={`flex-1 sm:flex-none px-14 py-5 rounded-[1.5rem] font-black transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-[0.2em] ${(!isCategoryValid && touched) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-100'}`}
                >
                  Commit Update
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