import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const VARIABLES = ['{{customer_name}}', '{{first_name}}', '{{phone}}', '{{city}}', '{{cart_model}}', '{{voltage}}', '{{install_date}}', '{{company_name}}', '{{company_phone}}', '{{company_email}}'];
const RECIPIENT_OPTIONS = ['All Customers', 'All Leads', 'Completed Jobs', 'Warranty', 'Scheduled', 'Custom List'];

function TemplateModal({ template, onClose, onSave }) {
  const [form, setForm] = useState(template || { name: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      if (template?.id) {
        const r = await api.put(`/email-templates/${template.id}`, form);
        onSave(r.data, 'update');
      } else {
        const r = await api.post('/email-templates', form);
        onSave(r.data, 'create');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg text-gray-900">{template?.id ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
            <input className="input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Your invoice from TG Golf Carts" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea className="input" rows={6} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Hi {{customer_name}},&#10;&#10;..." />
            <p className="text-xs text-gray-400 mt-1">Use variables like {`{{customer_name}}`} for personalization.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Template'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ name, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Delete Template?</h2>
        <p className="text-gray-600 mb-6">Delete <strong>{name}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Emails() {
  const [templates, setTemplates] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [campaign, setCampaign] = useState({
    recipients: 'All Customers',
    subject: '',
    body: '',
    templateId: '',
  });

  useEffect(() => {
    api.get('/email-templates').then(r => setTemplates(r.data)).catch(() => {});
  }, []);

  const handleSaveTemplate = (t, type) => {
    if (type === 'create') setTemplates(prev => [...prev, t]);
    else setTemplates(prev => prev.map(x => x.id === t.id ? t : x));
    setModal(null);
    toast.success(type === 'create' ? 'Template created' : 'Template updated');
  };

  const handleDeleteTemplate = async () => {
    try {
      await api.delete(`/email-templates/${deleteTarget.id}`);
      setTemplates(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Template deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const insertVariable = (v) => {
    setCampaign(c => ({ ...c, body: c.body + v }));
  };

  const loadTemplate = (id) => {
    if (!id) return;
    const t = templates.find(x => x.id === id);
    if (t) setCampaign(c => ({ ...c, subject: t.subject, body: t.body, templateId: id }));
  };

  const handleSendPreview = () => {
    toast('Email sending requires Gmail integration. Configure it in Admin Tools.', { icon: 'ℹ️' });
  };

  const handleSendCampaign = () => {
    if (!campaign.subject || !campaign.body) return toast.error('Subject and message required');
    toast('Email sending requires Gmail integration. Configure it in Admin Tools.', { icon: 'ℹ️' });
  };

  return (
    <AdminLayout title="Email Management">
      {modal && <TemplateModal template={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSaveTemplate} />}
      {deleteTarget && <DeleteModal name={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteTemplate} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Templates */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span>📄</span> Email Templates
              </h3>
            </div>
            <div className="space-y-2 mb-3">
              {templates.length === 0 ? (
                <p className="text-gray-400 text-sm">No templates yet.</p>
              ) : templates.map(t => (
                <div key={t.id} className="flex items-start justify-between p-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400 truncate">{t.body?.slice(0, 50) || '—'}</div>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button onClick={() => setModal(t)} className="p-1 text-gray-400 hover:text-brand-green transition-colors"><FiEdit2 size={13} /></button>
                    <button onClick={() => setDeleteTarget(t)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><FiTrash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setModal('new')} className="w-full border-2 border-dashed border-gray-200 hover:border-brand-green text-gray-500 hover:text-brand-green rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1">
              <FiPlus size={14} /> New Template
            </button>
          </div>

          {/* Variables */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><span>📋</span> Available Variables</h3>
            <p className="text-xs text-gray-400 mb-3">Click to insert into compose area</p>
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map(v => (
                <button key={v} onClick={() => insertVariable(v)} className="px-2 py-1 bg-brand-sage text-brand-deep text-xs rounded font-mono hover:bg-brand-green hover:text-white transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign history */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><span>📅</span> Campaign History</h3>
            <p className="text-gray-400 text-sm">No campaigns sent yet.</p>
          </div>
        </div>

        {/* Right panel — Compose */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><span>✉️</span> Compose Campaign</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
              <select className="input" disabled>
                <option>— select account —</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Connect a Gmail account in <a href="/admin/tools" className="text-brand-green hover:underline">Admin Tools</a> to enable sending.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <div className="flex flex-wrap gap-3">
                {RECIPIENT_OPTIONS.map(opt => (
                  <label key={opt} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="recipients"
                      checked={campaign.recipients === opt}
                      onChange={() => setCampaign(c => ({ ...c, recipients: opt }))}
                      className="text-brand-green"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input className="input" placeholder="e.g. Special offer for TG Golf Carts customers" value={campaign.subject} onChange={e => setCampaign(c => ({ ...c, subject: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Load Template</label>
              <select className="input" value={campaign.templateId} onChange={e => loadTemplate(e.target.value)}>
                <option value="">— choose a template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
              <textarea
                className="input w-full"
                rows={8}
                placeholder={`Write your message here. Use {{customer_name}} for personalization.`}
                value={campaign.body}
                onChange={e => setCampaign(c => ({ ...c, body: e.target.value }))}
              />
              <p className="text-xs text-gray-400 mt-1">HTML is supported. Variables like {`{{customer_name}}`} will be replaced per recipient.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSendPreview} className="btn-secondary flex items-center gap-2 text-sm">
                <FiSend size={14} /> Send Preview to Me
              </button>
              <button onClick={handleSendCampaign} className="btn-primary flex items-center gap-2 text-sm">
                <FiSend size={14} /> Send Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
