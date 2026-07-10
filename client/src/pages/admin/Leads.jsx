import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPhone, FiMail, FiX, FiDownload, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const STATUSES = ['new', 'contacted', 'booked', 'lost'];
const SERVICES = ['rental', 'lithium_conversion', 'battery_sale', 'maintenance', 'marketplace', 'other'];

const statusColor = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const empty = { name: '', phone: '', email: '', service: 'rental', notes: '', preferredDate: '', status: 'new', source: '' };

function LeadModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState(lead || empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      if (lead?.id) {
        const r = await api.put(`/leads/${lead.id}`, form);
        onSave(r.data, 'update');
      } else {
        const r = await api.post('/leads', form);
        onSave(r.data, 'create');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving lead');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg text-gray-900">{lead?.id ? 'Edit Lead' : 'Add Lead'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select className="input" value={form.service} onChange={e => set('service', e.target.value)}>
                {SERVICES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input className="input" type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input className="input" placeholder="e.g. Google, Referral" value={form.source} onChange={e => set('source', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ lead, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Delete Lead?</h2>
        <p className="text-gray-600 mb-6">Remove <strong>{lead.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(leads) {
  const headers = ['Name', 'Phone', 'Email', 'Service', 'Preferred Date', 'Status', 'Source', 'Submitted'];
  const rows = leads.map(l => [l.name, l.phone || '', l.email || '', l.service, l.preferredDate || '', l.status, l.source || '', new Date(l.createdAt).toLocaleDateString()]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function Leads() {
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('all');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await api.get('/leads');
      setAll(r.data);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const displayed = tab === 'all' ? all : all.filter(l => l.status === tab);

  const counts = STATUSES.reduce((acc, s) => { acc[s] = all.filter(l => l.status === s).length; return acc; }, {});

  const handleSave = (lead, type) => {
    if (type === 'create') setAll(prev => [lead, ...prev]);
    else setAll(prev => prev.map(x => x.id === lead.id ? lead : x));
    setModal(null);
    toast.success(type === 'create' ? 'Lead added' : 'Lead updated');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${deleteTarget.id}`);
      setAll(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Lead deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleStatusChange = async (lead, newStatus) => {
    try {
      const r = await api.put(`/leads/${lead.id}`, { ...lead, status: newStatus });
      setAll(prev => prev.map(x => x.id === lead.id ? r.data : x));
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <AdminLayout title="Leads">
      {modal && <LeadModal lead={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && <DeleteModal lead={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}

      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'all' ? 'bg-brand-green text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green'}`}
          >
            All {all.length}
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === s ? 'bg-brand-green text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} {counts[s] || 0}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(displayed)} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload size={14} /> Export Excel
          </button>
          <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={15} /> Add Lead
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <FiUsers size={44} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No leads yet</p>
            <p className="text-sm mt-1">New bookings from your website will appear here automatically.</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-400 text-right">{displayed.length} lead{displayed.length !== 1 ? 's' : ''}</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Name</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Phone</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Service</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Preferred Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Submitted</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs">Status</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium uppercase tracking-wide text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      {lead.email && <div className="text-xs text-gray-400 flex items-center gap-1"><FiMail size={11} /> {lead.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.phone ? <span className="flex items-center gap-1"><FiPhone size={12} /> {lead.phone}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{lead.service.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.preferredDate || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer appearance-none ${statusColor[lead.status]}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setModal(lead)} className="p-1.5 text-gray-400 hover:text-brand-green transition-colors mr-1"><FiEdit2 size={14} /></button>
                      <button onClick={() => setDeleteTarget(lead)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
