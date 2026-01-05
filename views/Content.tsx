import React, { useState } from 'react';
import { CMSPage, Banner, CommunicationTemplate } from '../types';
import OptimizedImage from '../components/OptimizedImage';

interface ContentProps {
  notify?: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => string;
}

const MOCK_PAGES: CMSPage[] = [
  { id: '1', title: 'About Us', slug: 'about-us', content: 'We are a leading commerce platform...', status: 'published', last_updated_at: '2025-02-10' },
  { id: '2', title: 'Privacy Policy', slug: 'privacy-policy', content: 'Your data is safe with us...', status: 'published', last_updated_at: '2025-01-15' },
  { id: '3', title: 'Terms of Service', slug: 'terms-of-service', content: 'By using this site you agree...', status: 'draft', last_updated_at: '2025-02-18' }
];

const MOCK_BANNERS: Banner[] = [
  { id: '1', title: 'Spring Collection 2025', image_url: 'https://picsum.photos/1200/400?random=1', position: 'hero_main', status: 'active', sort_order: 1 },
  { id: '2', title: 'Free Shipping Promo', image_url: 'https://picsum.photos/600/200?random=2', position: 'sub_banner', status: 'active', sort_order: 2 }
];

const MOCK_TEMPLATES: CommunicationTemplate[] = [
  { id: '1', name: 'Order Confirmation', channel: 'email', subject: 'Your Order #{{order_id}} is Confirmed', body: 'Hello {{customer_name}}, thank you for your order...', variables: ['customer_name', 'order_id', 'total'], purpose: 'transactional' },
  { id: '2', name: 'Flash Sale Alert', channel: 'push', body: 'Huge savings! Up to 50% off sitewide.', variables: ['discount'], purpose: 'marketing' }
];

const Content: React.FC<ContentProps> = ({ notify }) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'banners' | 'templates'>('pages');
  const [pages, setPages] = useState<CMSPage[]>(MOCK_PAGES);
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>(MOCK_TEMPLATES);

  const [showPageModal, setShowPageModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    notify?.("CMS Node successfully synchronized.", "success");
    setShowPageModal(false);
    setIsSubmitting(false);
  };

  const handleTestSend = async (id: string, name: string) => {
    setSendingId(id);
    await new Promise(r => setTimeout(r, 1500));
    setSendingId(null);
    notify?.(`Test payload dispatched for template: ${name}. Internal verification confirmed.`, "success");
  };

  const renderPages = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
      {pages.map(page => (
        <div key={page.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all group relative">
          <div className="flex justify-between items-start mb-8">
            <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {page.status}
            </span>
            <div className="flex gap-2">
              <button onClick={() => { setEditingItem(page); setShowPageModal(true); }} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">✏️</button>
            </div>
          </div>
          <h4 className="text-3xl font-black text-gray-900 mb-2 leading-none tracking-tighter">{page.title}</h4>
          <p className="text-xs text-indigo-600 font-bold font-mono tracking-tighter">/{page.slug}</p>
          <div className="mt-12 pt-10 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            <span>STAGED: {page.last_updated_at}</span>
            <button className="text-indigo-400 font-black hover:text-indigo-600 flex items-center gap-2 transition-all">
              Preview ↗
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => { setEditingItem({title: '', slug: '', status: 'draft'}); setShowPageModal(true); }} className="border-4 border-dashed border-gray-100 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 text-gray-300 hover:border-indigo-200 hover:text-indigo-600 transition-all group min-h-[300px]">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📄</span>
        <span className="font-black text-[11px] uppercase tracking-[0.3em]">Initialize Node</span>
      </button>
    </div>
  );

  const renderTemplates = () => (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] border-b border-gray-100">
            <tr>
              <th className="px-12 py-10">Template Node</th>
              <th className="px-12 py-10">Transport Protocol</th>
              <th className="px-12 py-10">Contextual Hooks</th>
              <th className="px-12 py-10 text-right">Ops Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {templates.map(temp => (
              <tr key={temp.id} className="hover:bg-indigo-50/20 transition-all duration-300 group">
                <td className="px-12 py-10">
                  <p className="font-black text-gray-900 text-xl tracking-tighter leading-tight">{temp.name}</p>
                  <p className="text-[10px] text-gray-400 font-black mt-2 uppercase tracking-widest">{temp.purpose}</p>
                </td>
                <td className="px-12 py-10">
                  <span className={`text-[10px] px-4 py-2 rounded-2xl font-black uppercase tracking-widest ${temp.channel === 'email' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                    {temp.channel}
                  </span>
                </td>
                <td className="px-12 py-10">
                  <div className="flex gap-2 flex-wrap max-w-[300px]">
                    {temp.variables.map(v => (
                      <span key={v} className="text-[10px] px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl font-mono">{`{{${v}}}`}</span>
                    ))}
                  </div>
                </td>
                <td className="px-12 py-10 text-right">
                  <button 
                    onClick={() => handleTestSend(temp.id, temp.name)}
                    disabled={sendingId !== null}
                    className={`
                      px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] transition-all active:scale-95 shadow-2xl
                      ${sendingId === temp.id 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}
                    `}
                  >
                    {sendingId === temp.id ? 'Transporting...' : 'Fire Test'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-6">Experience OS</h2>
          <p className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed">Design storefront touchpoints, orchestrate transactional flows, and manage marketing logic layers.</p>
        </div>
        <div className="flex gap-4 relative z-10 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none px-10 py-5 bg-gray-50 text-indigo-600 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-4 border border-gray-100">
            <span>🌐</span> Navigation Map
          </button>
          <button className="flex-1 xl:flex-none px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center justify-center gap-4 active:scale-95">
            <span>✨</span> Experience Plus
          </button>
        </div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-50 rounded-full opacity-50 blur-[100px]"></div>
      </header>

      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
        <div className="flex border-b border-gray-100 px-12 bg-gray-50/20">
          {[
            { id: 'pages', label: 'Static Experience', icon: '📄' },
            { id: 'banners', label: 'Marketing Matrix', icon: '🎨' },
            { id: 'templates', label: 'System Messaging', icon: '📧' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-12 py-10 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-8 flex items-center gap-4 ${
                activeTab === tab.id 
                  ? 'text-indigo-600 border-indigo-600 bg-white' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-12 lg:p-20">
          {activeTab === 'pages' && renderPages()}
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
               {banners.map(b => (
                 <div key={b.id} className="relative aspect-[16/7] rounded-[4rem] overflow-hidden group shadow-2xl shadow-gray-200 cursor-pointer border-8 border-white">
                   <OptimizedImage src={b.image_url} alt={b.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-12 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">{b.position.replace('_', ' ')}</span>
                     <h4 className="text-4xl font-black text-white tracking-tighter">{b.title}</h4>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;