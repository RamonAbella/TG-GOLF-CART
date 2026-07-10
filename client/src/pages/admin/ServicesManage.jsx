import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiX, FiUpload, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const TYPE_OPTIONS = [
  { value: 'battery_conversion', label: 'Lithium Battery Conversion' },
  { value: 'battery_sale', label: 'Battery Sale' },
  { value: 'installation', label: 'Professional Installation' },
  { value: 'maintenance', label: 'Maintenance & Repair' },
  { value: 'custom', label: 'Custom / Other' },
];

const EMPTY_OFFERING = {
  type: 'battery_conversion', title: '', shortDesc: '', description: '',
  price: '', benefits: '', isPopular: false, isActive: true, orderIndex: 0, image: '',
};

function ServiceForm({ offering, onSave, onCancel, isNew }) {
  const [form, setForm] = useState({
    ...offering,
    benefits: Array.isArray(offering.benefits) ? offering.benefits.join('\n') : offering.benefits || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

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
      setForm(f => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        benefits: form.benefits.split('\n').map(b => b.trim()).filter(Boolean),
      };
      if (isNew) {
        await api.post('/offerings', payload);
        toast.success('Service created');
      } else {
        await api.put(`/offerings/${offering.id}`, payload);
        toast.success('Service updated');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="font-bold text-xl">{isNew ? 'Add New Service' : `Edit: ${offering.title}`}</h2>
          <button onClick={onCancel}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isNew && (
            <div>
              <label className="label">Service Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Service Image (optional)</label>
            {form.image && (
              <div className="relative mb-3 rounded-xl overflow-hidden h-36">
                <img src={form.image} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black">
                  <FiX size={14} />
                </button>
              </div>
            )}
            <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors text-sm disabled:opacity-50">
              {uploading ? 'Uploading...' : <><FiUpload size={16} /> Upload Image</>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>

          <div>
            <label className="label">Service Title *</label>
            <input className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="label">Short Description (shown on homepage)</label>
            <input className="input" value={form.shortDesc} onChange={e => setForm({...form, shortDesc: e.target.value})} />
          </div>
          <div>
            <label className="label">Full Description</label>
            <textarea className="input resize-none h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="label">Price (e.g. "From $1,200")</label>
            <input className="input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          </div>
          <div>
            <label className="label">Benefits (one per line)</label>
            <textarea className="input resize-none h-36" value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} placeholder="3x longer range&#10;Charges in 3-5 hours&#10;10+ year life" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="popular" checked={form.isPopular} onChange={e => setForm({...form, isPopular: e.target.checked})} className="w-4 h-4 accent-brand-green" />
            <label htmlFor="popular" className="text-sm text-gray-700">Mark as "Most Popular"</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-brand-green" />
            <label htmlFor="active" className="text-sm text-gray-700">Visible on website</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving...' : isNew ? 'Add Service' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminServicesManage() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/offerings/all'); setOfferings(data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/offerings/${confirmDelete.id}`);
      toast.success(`"${confirmDelete.title}" deleted`);
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
    setDeleting(false);
  };

  return (
    <AdminLayout title="Manage Services">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">Edit the services shown on your Services page. Changes are live immediately.</p>
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 btn-primary text-sm px-4 py-2"
        >
          <FiPlus size={16} /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="card h-48 animate-pulse bg-gray-50" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offerings.map(o => (
            <div key={o.id} className={`card overflow-hidden ${!o.isActive ? 'opacity-50' : ''}`}>
              {o.image && <img src={o.image} alt={o.title} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{o.title}</h3>
                      {o.isPopular && <span className="badge bg-yellow-100 text-yellow-700 text-xs">Popular</span>}
                      {!o.isActive && <span className="badge bg-gray-100 text-gray-500 text-xs">Hidden</span>}
                    </div>
                    <div className="text-brand-green font-semibold text-sm">{o.price}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(o)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-green transition-colors">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => setConfirmDelete(o)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-xs line-clamp-2">{o.shortDesc}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(o.benefits || []).slice(0, 3).map(b => (
                    <span key={b} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FiCheck size={10} className="text-brand-green" />{b}
                    </span>
                  ))}
                  {(o.benefits || []).length > 3 && <span className="text-xs text-gray-400">+{o.benefits.length - 3} more</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <ServiceForm offering={editing} onSave={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} isNew={false} />}
      {addingNew && <ServiceForm offering={EMPTY_OFFERING} onSave={() => { setAddingNew(false); load(); }} onCancel={() => setAddingNew(false)} isNew={true} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-2">Delete Service?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently remove <span className="font-semibold text-gray-800">"{confirmDelete.title}"</span> from your website. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
