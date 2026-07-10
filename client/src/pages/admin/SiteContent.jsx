import { useState, useEffect, useRef } from 'react';
import { FiSave, FiUpload, FiCheck, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const sectionLabels = {
  homepage: '🏠 Homepage',
  pricing: '💰 Pricing Comparison',
  contact: '📞 Contact Info',
};

function ContentField({ item, onSave }) {
  const [value, setValue] = useState(item.value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const isImage = item.key.includes('image');

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/content/${item.key}`, { value });
      setSaved(true);
      onSave(item.key, value);
      setTimeout(() => setSaved(false), 2000);
      toast.success(`${item.label} saved`);
    } catch {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValue(data.url);
      toast.success('Image uploaded — click Save to apply');
    } catch {
      toast.error('Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{item.label}</label>
      <div className="text-xs text-gray-400 mb-2 font-mono">{item.key}</div>

      {isImage ? (
        <div className="space-y-2">
          {value && (
            <div className="relative rounded-xl overflow-hidden h-32">
              <img src={value} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="input flex-1 text-xs"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="https://... or upload below"
            />
            <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
              className="px-3 py-2 border border-gray-200 rounded-xl text-gray-500 hover:text-brand-green hover:border-brand-green transition-colors text-sm flex items-center gap-1">
              <FiUpload size={14} /> {uploading ? '...' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        </div>
      ) : (
        <textarea
          className="input resize-none"
          rows={value.length > 80 ? 3 : 1}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      )}

      <button
        onClick={save}
        disabled={saving || value === item.value}
        className={`mt-2 w-full py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
          saved ? 'bg-green-100 text-green-700' :
          value === item.value ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
          'bg-brand-green text-white hover:bg-brand-green/90'
        }`}
      >
        {saved ? <><FiCheck size={14} /> Saved!</> : saving ? 'Saving...' : <><FiSave size={14} /> Save Change</>}
      </button>
    </div>
  );
}

export default function AdminSiteContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/content/all').then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = (key, value) => {
    setItems(prev => prev.map(i => i.key === key ? { ...i, value } : i));
  };

  const sections = [...new Set(items.map(i => i.section))];

  return (
    <AdminLayout title="Site Content">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">Edit any text, image, or price shown on your website. Changes go live instantly.</p>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-brand-green hover:underline">
          View Site <FiExternalLink size={14} />
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(section => (
            <div key={section}>
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">
                {sectionLabels[section] || section}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.filter(i => i.section === section).map(item => (
                  <ContentField key={item.key} item={item} onSave={handleSave} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
