
import React, { useState } from 'react';
import { CMSPage, Banner, CommunicationTemplate } from '../types';

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

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'banners' | 'templates'>('pages');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const renderPages = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_PAGES.map(page => (
        <div key={page.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
              page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {page.status}
            </span>
            <button className="text-gray-300 hover:text-indigo-600">✏️</button>
          </div>
          <h4 className="text-xl font-black text-gray-900 mb-1">{page.title}</h4>
          <p className="text-xs text-indigo-600 font-bold font-mono">/{page.slug}</p>
          <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
            <span>Updated: {page.last_updated_at}</span>
            <button className="text-gray-400 hover:text-gray-900">Preview ↗</button>
          </div>
        </div>
      ))}
      <button className="border-4 border-dashed border-gray-50 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-indigo-100 hover:text-indigo-600 transition-all">
        <span className="text-4xl">📄</span>
        <span className="font-black text-sm">Create New Page</span>
      </button>
    </div>
  );

  const renderBanners = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Storefront Placements</h4>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100">
          Upload Asset
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {MOCK_BANNERS.map(banner => (
          <div key={banner.id} className="relative aspect-[3/1] rounded-[2.5rem] overflow-hidden group border border-gray-100 shadow-sm">
            <img src={banner.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={banner.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-2 block">{banner.position.replace('_', ' ')}</span>
                  <h4 className="text-2xl font-black text-white">{banner.title}</h4>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20">👁️</button>
                  <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/20">⚙️</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
          <tr>
            <th className="px-8 py-5">Template Name</th>
            <th className="px-8 py-5">Channel</th>
            <th className="px-8 py-5">Purpose</th>
            <th className="px-8 py-5">Variables</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_TEMPLATES.map(temp => (
            <tr key={temp.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-8 py-5">
                <p className="font-black text-gray-900">{temp.name}</p>
                {temp.subject && <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{temp.subject}</p>}
              </td>
              <td className="px-8 py-5">
                <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter ${
                  temp.channel === 'email' ? 'bg-indigo-100 text-indigo-700' : 
                  temp.channel === 'push' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {temp.channel}
                </span>
              </td>
              <td className="px-8 py-5">
                <span className="text-xs font-bold text-gray-500 uppercase">{temp.purpose}</span>
              </td>
              <td className="px-8 py-5">
                <div className="flex gap-1 flex-wrap">
                  {temp.variables.map(v => (
                    <span key={v} className="text-[8px] px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-md">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <button className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100">Test Send</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Content Experience</h2>
          <p className="text-gray-500 mt-1">Manage storefront messaging, banners, and automation templates.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <span>🌐</span> Site Map
          </button>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100">
            <span>✨</span> CMS Plus
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {[
            { id: 'pages', label: 'Static Pages', icon: '📄' },
            { id: 'banners', label: 'Banners & Marketing', icon: '🎨' },
            { id: 'templates', label: 'System Messaging', icon: '📧' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-8 py-5 text-sm font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50/20' 
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'pages' && renderPages()}
          {activeTab === 'banners' && renderBanners()}
          {activeTab === 'templates' && renderTemplates()}
        </div>
      </div>
    </div>
  );
};

export default Content;
