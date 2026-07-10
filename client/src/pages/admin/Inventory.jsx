import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const defaultCart = {
  name: '', model: '', year: new Date().getFullYear(), capacity: 4,
  type: 'electric', color: '', description: '', features: '',
  images: [], dailyRate: 89, weeklyRate: 499, monthlyRate: 1499, status: 'available',
};

function ImageUploader({ images, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (['heic', 'heif'].includes(ext) || file.type === 'image/heic' || file.type === 'image/heif') {
      toast.error('iPhone HEIC photos can\'t display in browsers. Open the photo on your iPhone → tap Share → "Save as JPG", then upload that file.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...images, data.url]);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="label">Cart Photos</label>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
            >
              <FiX size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-brand-green rounded-full animate-spin" />
          ) : (
            <>
              <FiUpload size={20} />
              <span className="text-xs mt-1">Upload</span>
            </>
          )}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <p className="text-xs text-gray-400">Click the + to upload photos from your computer. First photo is the main image.</p>
    </div>
  );
}

function CartForm({ cart, onSave, onCancel }) {
  const [form, setForm] = useState(
    cart ? {
      ...cart,
      features: Array.isArray(cart.features) ? cart.features.join(', ') : cart.features,
      images: Array.isArray(cart.images) ? cart.images : [],
    } : { ...defaultCart }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error('Cart name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        images: form.images,
      };
      if (cart?.id) {
        await api.put(`/carts/${cart.id}`, payload);
        toast.success('Cart updated');
      } else {
        await api.post('/carts', payload);
        toast.success('Cart added');
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
          <h2 className="font-bold text-xl">{cart?.id ? 'Edit Cart' : 'Add Cart'}</h2>
          <button onClick={onCancel}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ImageUploader images={form.images} onChange={imgs => setForm({ ...form, images: imgs })} />

          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Cart Name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Island Cruiser 4-Seater" /></div>
            <div><label className="label">Model</label><input className="input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="Club Car Precedent" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Year</label><input className="input" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} /></div>
            <div><label className="label">Seats</label><input className="input" type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
            <div><label className="label">Color</label><input className="input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Pearl White" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="electric">Electric</option>
                <option value="lithium">Lithium</option>
                <option value="gas">Gas</option>
              </select>
            </div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea className="input resize-none h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe this cart for customers..." /></div>
          <div><label className="label">Features (comma-separated)</label><input className="input" value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="USB Ports, Bluetooth, Windshield" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Daily Rate ($)</label><input className="input" type="number" value={form.dailyRate} onChange={e => setForm({...form, dailyRate: e.target.value})} /></div>
            <div><label className="label">Weekly Rate ($)</label><input className="input" type="number" value={form.weeklyRate} onChange={e => setForm({...form, weeklyRate: e.target.value})} /></div>
            <div><label className="label">Monthly Rate ($)</label><input className="input" type="number" value={form.monthlyRate} onChange={e => setForm({...form, monthlyRate: e.target.value})} /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving...' : 'Save Cart'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCarts = async () => {
    setLoading(true);
    try { const { data } = await api.get('/carts'); setCarts(data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCarts(); }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/carts/${confirmDelete.id}`);
      setCarts(c => c.filter(x => x.id !== confirmDelete.id));
      toast.success('Cart deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
    setDeleting(false);
  };

  const statusColors = { available: 'badge-available', booked: 'badge-booked', maintenance: 'badge bg-orange-100 text-orange-700' };

  return (
    <AdminLayout title="Cart Inventory">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-500 text-sm">{carts.length} carts total</span>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {!loading && carts.map(cart => (
          <div key={cart.id} className="card overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              {cart.images?.[0] ? (
                <img src={cart.images[0]} alt={cart.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <FiImage size={40} />
                </div>
              )}
              <span className={`absolute top-2 right-2 ${statusColors[cart.status] || 'badge bg-gray-100'}`}>{cart.status}</span>
            </div>
            <div className="p-4">
              <div className="font-bold text-gray-800 mb-0.5">{cart.name}</div>
              <div className="text-xs text-gray-400 mb-3">{cart.year} · {cart.capacity} seats · {cart.type}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-gray-800">${cart.dailyRate}</div><div className="text-gray-400">Daily</div></div>
                <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-gray-800">${cart.weeklyRate}</div><div className="text-gray-400">Weekly</div></div>
                <div className="bg-gray-50 rounded-lg p-2"><div className="font-bold text-gray-800">${cart.monthlyRate}</div><div className="text-gray-400">Monthly</div></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(cart)} className="btn-secondary flex-1 text-sm py-1.5 flex items-center justify-center gap-1"><FiEdit2 size={14} /> Edit</button>
                <button onClick={() => setConfirmDelete(cart)} className="flex-1 text-sm py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1"><FiTrash2 size={14} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
        {loading && [1,2,3].map(i => <div key={i} className="card h-64 animate-pulse bg-gray-50" />)}
      </div>

      {!loading && carts.length === 0 && (
        <div className="card p-12 text-center">
          <FiImage size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No carts yet. Add your first cart to get started.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add First Cart</button>
        </div>
      )}

      {showAdd && <CartForm onSave={() => { setShowAdd(false); fetchCarts(); }} onCancel={() => setShowAdd(false)} />}
      {editing && <CartForm cart={editing} onSave={() => { setEditing(null); fetchCarts(); }} onCancel={() => setEditing(null)} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-2">Delete Cart?</h3>
            <p className="text-gray-500 text-sm mb-6">This will permanently remove <span className="font-semibold text-gray-800">"{confirmDelete.name}"</span> and all its bookings. This cannot be undone.</p>
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
