import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus, FiX, FiUpload, FiEdit2 } from 'react-icons/fi';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const EMPTY_LISTING = {
  title: '', make: '', model: '', year: new Date().getFullYear(),
  condition: 'excellent', price: '', description: '', features: '',
  images: [], location: 'Key Biscayne, FL',
  sellerName: 'TG Golf Carts', sellerEmail: 'tgolfcarts@gmail.com', sellerPhone: '(786) 395-2805',
};

function ImageUploader({ images, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (['heic', 'heif'].includes(ext)) {
      toast.error('iPhone HEIC photos not supported. Please export as JPG first.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange([...images, data.url]);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div>
      <label className="label">Photos</label>
      <div className="flex flex-wrap gap-3 mb-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, i) => i !== idx))}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <FiX size={16} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-50 text-xs gap-1">
          {uploading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-green rounded-full animate-spin" /> : <><FiUpload size={16} /><span>Upload</span></>}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ListingForm({ listing, onSave, onCancel, isNew }) {
  const [form, setForm] = useState({
    ...listing,
    features: Array.isArray(listing.features) ? listing.features.join(', ') : listing.features || '',
    images: Array.isArray(listing.images) ? listing.images : [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.make || !form.model || !form.price || !form.sellerName || !form.sellerEmail || !form.sellerPhone) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        images: form.images,
        price: parseFloat(form.price),
        year: parseInt(form.year),
      };
      if (isNew) {
        await api.post('/marketplace/admin', payload);
        toast.success('Listing created and live on marketplace');
      } else {
        await api.put(`/marketplace/${listing.id}`, payload);
        toast.success('Listing updated');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
    setSaving(false);
  };

  const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="font-bold text-xl">{isNew ? 'Add Marketplace Listing' : 'Edit Listing'}</h2>
          <button onClick={onCancel}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploader images={form.images} onChange={imgs => setForm({ ...form, images: imgs })} />

          <div>
            <label className="label">Listing Title *</label>
            <input className="input" placeholder='e.g. "2022 Yamaha Drive2 — Lifted & Custom"' {...f('title')} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Make *</label><input className="input" placeholder="Yamaha" {...f('make')} /></div>
            <div><label className="label">Model *</label><input className="input" placeholder="Drive2" {...f('model')} /></div>
            <div><label className="label">Year *</label><input className="input" type="number" {...f('year')} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Condition *</label>
              <select className="input" {...f('condition')}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div><label className="label">Price ($) *</label><input className="input" type="number" placeholder="12500" {...f('price')} /></div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none h-24" placeholder="Describe the cart, any upgrades, history..." {...f('description')} />
          </div>

          <div>
            <label className="label">Features (comma-separated)</label>
            <input className="input" placeholder="Lifted, Custom wheels, LED lights, Bluetooth" {...f('features')} />
          </div>

          <div><label className="label">Location</label><input className="input" {...f('location')} /></div>

          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Seller Info</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">Name *</label><input className="input" {...f('sellerName')} /></div>
              <div><label className="label">Email *</label><input className="input" type="email" {...f('sellerEmail')} /></div>
              <div><label className="label">Phone *</label><input className="input" {...f('sellerPhone')} /></div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving...' : isNew ? 'Post Listing' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMarketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/marketplace?status=${statusFilter}`);
      setListings(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/marketplace/${id}/status`, { status });
      toast.success('Status updated');
      fetchListings();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/marketplace/${confirmDelete.id}`);
      setListings(l => l.filter(x => x.id !== confirmDelete.id));
      toast.success('Listing deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
    setDeleting(false);
  };

  const conditionColors = { excellent: 'badge bg-green-100 text-green-700', good: 'badge bg-blue-100 text-blue-700', fair: 'badge bg-yellow-100 text-yellow-700', poor: 'badge bg-red-100 text-red-700' };
  const statusColors = { active: 'badge-available', pending: 'badge-pending', sold: 'badge bg-gray-100 text-gray-600' };

  return (
    <AdminLayout title="Marketplace Listings">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-3 flex-wrap">
          {[{ v: 'active', l: 'Active' }, { v: 'pending', l: 'Pending Review' }, { v: 'sold', l: 'Sold' }].map(s => (
            <button key={s.v} onClick={() => setStatusFilter(s.v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-card ${statusFilter === s.v ? 'bg-brand-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {s.l}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={16} /> Add Listing
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Listing</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Seller</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Condition</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Submitted</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : listings.length === 0 ? (
              <tr><td colSpan={7} className="p-12 text-center text-gray-400">
                No listings found.{' '}
                <button onClick={() => setShowAdd(true)} className="text-brand-green underline">Add the first one</button>
              </td></tr>
            ) : listings.map(l => (
              <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {l.images?.[0] && <img src={l.images[0]} alt="" className="w-12 h-10 object-cover rounded-lg mb-1" />}
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-gray-400">{l.year} {l.make} {l.model}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{l.sellerName}</div>
                  <div className="text-xs text-gray-400">{l.sellerEmail}</div>
                </td>
                <td className="px-4 py-3 font-bold text-brand-green">${l.price.toLocaleString()}</td>
                <td className="px-4 py-3"><span className={conditionColors[l.condition] || 'badge bg-gray-100'}>{l.condition}</span></td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(l.createdAt), 'MMM d')}</td>
                <td className="px-4 py-3"><span className={statusColors[l.status] || 'badge bg-gray-100'}>{l.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green">
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                    </select>
                    <button onClick={() => setEditing(l)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-green transition-colors">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => setConfirmDelete(l)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <ListingForm listing={EMPTY_LISTING} onSave={() => { setShowAdd(false); fetchListings(); }} onCancel={() => setShowAdd(false)} isNew={true} />}
      {editing && <ListingForm listing={editing} onSave={() => { setEditing(null); fetchListings(); }} onCancel={() => setEditing(null)} isNew={false} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-2">Delete Listing?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently remove <span className="font-semibold text-gray-800">"{confirmDelete.title}"</span>. This cannot be undone.</p>
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
