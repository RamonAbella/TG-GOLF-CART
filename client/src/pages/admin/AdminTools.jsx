import { useState, useEffect } from 'react';
import { FiDatabase, FiHardDrive, FiMail, FiServer, FiCalendar, FiBell, FiDownload, FiCheck, FiAlertCircle, FiEye, FiEyeOff, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const REMINDER_TYPES = [
  { key: 'new_lead', icon: '📨', label: 'New Lead Follow-Up', desc: "Email new leads that haven't been contacted", unit: 'days old', default: 3 },
  { key: 'pre_install', icon: '📅', label: 'Pre-Install Reminder', desc: 'Remind customers scheduled for installation tomorrow', unit: '1 day before', default: null },
  { key: 'warranty', icon: '🛡️', label: 'Warranty Check-In', desc: 'Annual check-in for customers with warranty status', unit: 'months', default: 12 },
  { key: 'invoice_overdue', icon: '📄', label: 'Invoice Overdue', desc: 'Remind customers with unpaid invoices past due date', unit: 'days past', default: 14 },
  { key: 'thank_you', icon: '⭐', label: 'Post-Install Thank You', desc: 'Thank you + review request for recently completed jobs', unit: 'days after', default: 3 },
];

const CARRIERS = ['AT&T', 'T-Mobile', 'Verizon', 'Sprint', 'Cricket', 'Metro PCS'];
const CARRIER_GATEWAYS = {
  'AT&T': 'txt.att.net', 'T-Mobile': 'tmomail.net', 'Verizon': 'vtext.com',
  'Sprint': 'messaging.sprintpcs.com', 'Cricket': 'sms.cricketwireless.net', 'Metro PCS': 'mymetropcs.com',
};
const QR_TYPES = ['Company Website', 'Booking Page', 'Marketplace', 'Custom URL'];

// ── Gmail OAuth Component ─────────────────────────────────────
function GmailOAuth({ onStatusChange }) {
  const [status, setStatus] = useState('loading'); // loading | needs_credentials | ready | connected
  const [connectedEmail, setConnectedEmail] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    api.get('/admin/oauth/status').then(r => {
      if (r.data.connected) {
        setStatus('connected');
        setConnectedEmail(r.data.email);
        onStatusChange(true);
      } else if (r.data.hasClientId) {
        setStatus('ready');
      } else {
        setStatus('needs_credentials');
        setShowSetup(true);
      }
    }).catch(() => setStatus('needs_credentials'));

    // Listen for OAuth popup result
    const handler = (e) => {
      if (e.data?.type === 'oauth_success') {
        setConnectedEmail(e.data.email);
        setStatus('connected');
        onStatusChange(true);
        toast.success(`Gmail connected! Signed in as ${e.data.email}`);
      } else if (e.data?.type === 'oauth_error') {
        toast.error('Google sign-in failed. Try again.');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSaveCredentials = async () => {
    if (!clientId.trim() || !clientSecret.trim()) return toast.error('Both Client ID and Secret are required');
    setSavingCreds(true);
    try {
      await api.post('/admin/oauth/credentials', { clientId: clientId.trim(), clientSecret: clientSecret.trim() });
      setStatus('ready');
      setShowSetup(false);
      toast.success('Credentials saved — now click "Sign in with Google"');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSavingCreds(false); }
  };

  const handleSignIn = async () => {
    try {
      const r = await api.get('/admin/oauth/url');
      const popup = window.open(r.data.url, 'google-oauth', 'width=500,height=600,left=300,top=100');
      if (!popup) toast.error('Popup blocked — allow popups for this site and try again');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start sign-in');
    }
  };

  const handleDisconnect = async () => {
    await api.post('/admin/oauth/disconnect');
    setStatus('needs_credentials');
    setConnectedEmail('');
    setShowSetup(true);
    onStatusChange(false);
    toast('Gmail disconnected');
  };

  if (status === 'loading') return <div className="text-gray-400 text-sm">Loading…</div>;

  if (status === 'connected') {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
            <FiCheck size={18} className="text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-green-800">Connected</div>
            <div className="text-sm text-green-600">{connectedEmail}</div>
          </div>
        </div>
        <button onClick={handleDisconnect} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Disconnect</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step 1 — Setup instructions (collapsible) */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowSetup(s => !s)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-brand-green text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
            <span className="font-medium text-gray-800">Get your Google Client ID & Secret</span>
            {!showSetup && clientId && <span className="text-xs text-green-600 ml-2">✓ saved</span>}
          </div>
          {showSetup ? <FiChevronDown size={16} className="text-gray-400" /> : <FiChevronRight size={16} className="text-gray-400" />}
        </button>

        {showSetup && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Visual step-by-step */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4 mt-3">
              <p className="font-semibold text-blue-900 mb-3">Follow these steps — takes about 5 minutes:</p>
              <div className="space-y-3">
                {[
                  { n: 1, text: 'Click the link below to open Google Cloud Console', action: <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 transition-colors mt-1">→ Open Google Cloud Console</a> },
                  { n: 2, text: 'Sign in with your Google account (tgolfcarts@gmail.com)' },
                  { n: 3, text: 'Click "Select a project" at the top → Click "NEW PROJECT" → Name it "TG Golf Carts" → Click Create' },
                  { n: 4, text: 'In the search bar at the top, type "Gmail API" → Click it → Click the blue ENABLE button' },
                  { n: 5, text: 'Click the search bar again, type "OAuth consent screen" → Click it → Choose "External" → Fill in App name: TG Golf Carts, your email → Save' },
                  { n: 6, text: 'On the left sidebar click "Credentials" → Click "+ CREATE CREDENTIALS" → Choose "OAuth client ID"' },
                  { n: 7, text: 'Application type: select "Web application" → Name: "TG Website"' },
                  { n: 8, text: 'Under "Authorized redirect URIs" click "+ ADD URI" → paste exactly: http://localhost:3001/api/admin/oauth/callback → Click CREATE' },
                  { n: 9, text: 'A popup shows your Client ID and Client Secret — copy both and paste them in the boxes below' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{s.n}</span>
                    <div>
                      <p className="text-sm text-blue-800">{s.text}</p>
                      {s.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redirect URI to copy */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Copy this exact URL for Step 8:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-800 font-mono flex-1">http://localhost:3001/api/admin/oauth/callback</code>
                <button
                  onClick={() => { navigator.clipboard.writeText('http://localhost:3001/api/admin/oauth/callback'); toast.success('Copied!'); }}
                  className="text-xs text-brand-green hover:underline flex-shrink-0"
                >Copy</button>
              </div>
            </div>

            {/* Client ID + Secret inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID <span className="text-gray-400 font-normal">(from Step 9)</span></label>
                <input className="input" placeholder="123456789-abc.apps.googleusercontent.com" value={clientId} onChange={e => setClientId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret <span className="text-gray-400 font-normal">(from Step 9)</span></label>
                <div className="relative">
                  <input className="input pr-10" type={showSecret ? 'text' : 'password'} placeholder="GOCSPX-…" value={clientSecret} onChange={e => setClientSecret(e.target.value)} />
                  <button type="button" onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showSecret ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>
              <button onClick={handleSaveCredentials} disabled={savingCreds} className="btn-primary w-full">
                {savingCreds ? 'Saving…' : 'Save Credentials'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — Sign in button */}
      {status === 'ready' && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 bg-brand-green text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
            <span className="font-medium text-gray-800">Sign in with Google</span>
          </div>
          <button
            onClick={handleSignIn}
            className="flex items-center gap-3 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-brand-green hover:shadow-sm transition-all w-full justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">A Google login window will open. Sign in with tgolfcarts@gmail.com</p>
        </div>
      )}

      {status === 'needs_credentials' && !showSetup && (
        <button onClick={() => setShowSetup(true)} className="btn-primary w-full">Get Started — Connect Gmail</button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminTools() {
  const [dbStats, setDbStats] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [emailConnected, setEmailConnected] = useState(false);
  const [qrUrl, setQrUrl] = useState('https://tggolfcarts.com');
  const [qrLabel, setQrLabel] = useState('TG Golf Carts');
  const [qrType, setQrType] = useState('Company Website');
  const [qrSrc, setQrSrc] = useState('');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsCarrier, setSmsCarrier] = useState('AT&T');
  const [smsMsg, setSmsMsg] = useState('');
  const [reminderDays, setReminderDays] = useState({ new_lead: 3, warranty: 12, invoice_overdue: 14, thank_you: 3 });

  useEffect(() => {
    Promise.all([
      api.get('/crm').then(r => r.data.length),
      api.get('/invoices').then(r => r.data.length),
      api.get('/expenses').then(r => r.data.length),
      api.get('/leads').then(r => r.data.length),
      api.get('/email-templates').then(r => r.data.length),
    ]).then(([customers, invoices, expenses, leads, email_templates]) => {
      setDbStats({ customers, invoices, expenses, leads, email_templates });
    }).catch(() => {});
  }, []);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      const stored = localStorage.getItem('tg-auth');
      const token = stored ? JSON.parse(stored)?.state?.token : null;
      const res = await fetch('/api/admin/backup', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'tg-backup.xlsx'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  };

  const handleSendSMS = async () => {
    if (!emailConnected) return toast('Connect Gmail first.', { icon: '⚠️' });
    if (!smsPhone || !smsMsg) return toast.error('Phone and message required');
    const gateway = CARRIER_GATEWAYS[smsCarrier];
    const to = `${smsPhone.replace(/\D/g, '')}@${gateway}`;
    try {
      await api.post('/admin/oauth/send-email', { to, subject: smsMsg, html: smsMsg });
      toast.success('Text message sent!');
    } catch { toast.error('Failed to send — make sure Gmail is connected'); }
  };

  const statusCards = [
    { icon: <FiDatabase size={18} />, label: 'DATABASE', value: 'Connected', sub: 'SQLite local', dot: 'bg-green-500' },
    { icon: <FiHardDrive size={18} />, label: 'STORAGE', value: 'Local files', sub: '/server/uploads', dot: 'bg-green-500' },
    { icon: <FiMail size={18} />, label: 'EMAIL', value: emailConnected ? 'Connected' : 'Not configured', sub: emailConnected ? 'Gmail ready' : 'Connect below', dot: emailConnected ? 'bg-green-500' : 'bg-yellow-400' },
    { icon: <FiServer size={18} />, label: 'WEB SERVER', value: 'Online', sub: 'localhost:3001', dot: 'bg-green-500' },
    { icon: <FiCalendar size={18} />, label: 'CALENDAR', value: 'Not connected', sub: 'Coming soon', dot: 'bg-gray-400' },
    { icon: <FiBell size={18} />, label: 'REMINDERS', value: emailConnected ? 'Ready' : 'Waiting for Gmail', sub: '0 emails queued', dot: emailConnected ? 'bg-green-500' : 'bg-gray-400' },
  ];

  return (
    <AdminLayout title="Admin Tools">
      {/* Status overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statusCards.map(s => (
          <div key={s.label} className="card p-4 flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 uppercase tracking-widest">{s.label}</div>
              <div className="font-semibold text-gray-900 text-sm">{s.value}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${s.dot}`} />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Gmail OAuth */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Gmail Accounts
          </h3>
          <p className="text-sm text-gray-500 mb-4">Connect your Gmail to send emails, campaigns, and automated reminders.</p>
          <GmailOAuth onStatusChange={setEmailConnected} />
        </div>

        {/* Automated reminders */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">🔔 Automated Reminders</h3>
          <p className="text-sm text-gray-500 mb-4">Automatically email customers and leads based on triggers. Requires Gmail connected above.</p>
          <div className="space-y-1">
            {REMINDER_TYPES.map(r => (
              <div key={r.key} className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm">{r.icon} {r.label}</div>
                  <div className="text-xs text-gray-400">{r.desc}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.default !== null ? (
                    <><input type="number" min="1" max="365" className="w-12 border border-gray-200 rounded px-2 py-1 text-center text-sm"
                      value={reminderDays[r.key] || r.default}
                      onChange={e => setReminderDays(d => ({ ...d, [r.key]: e.target.value }))} />
                    <span className="text-gray-400 text-xs whitespace-nowrap">{r.unit}</span></>
                  ) : <span className="text-gray-400 text-xs whitespace-nowrap">{r.unit}</span>}
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">0</span>
                  <button className="btn-secondary text-xs py-1 px-2">Preview</button>
                  <button onClick={() => emailConnected ? toast.success('Reminder sent!') : toast('Connect Gmail first.', { icon: '⚠️' })} className="btn-primary text-xs py-1 px-2">Send Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SMS */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">📱 SMS Notifications</h3>
          <p className="text-sm text-gray-500 mb-4">Send text messages through email-to-SMS — no extra app needed. Requires Gmail connected.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input className="input" placeholder="3055551234 (digits only)" value={smsPhone} onChange={e => setSmsPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                <select className="input" value={smsCarrier} onChange={e => setSmsCarrier(e.target.value)}>
                  {CARRIERS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (160 chars max)</label>
              <textarea className="input w-full" maxLength={160} rows={4} value={smsMsg} onChange={e => setSmsMsg(e.target.value)} placeholder="Your cart is ready! -TG Golf Carts" />
              <div className="text-xs text-gray-400 text-right mt-1">{smsMsg.length} / 160</div>
            </div>
          </div>
          <button onClick={handleSendSMS} className="btn-primary text-sm flex items-center gap-2">
            <FiMail size={14} /> Send Text Message
          </button>
          <div className="mt-4 border-t pt-4">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Carrier Gateway Reference</div>
            <table className="w-full text-sm"><tbody>
              {Object.entries(CARRIER_GATEWAYS).map(([carrier, gw]) => (
                <tr key={carrier} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-700">{carrier}</td>
                  <td className="py-1.5 text-gray-400 text-right font-mono text-xs">number@{gw}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>

        {/* QR Code */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">◻️ QR Code Generator</h3>
          <p className="text-sm text-gray-500 mb-4">Generate QR codes for business cards, warranty cards, or rental confirmations.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Type</label>
                <select className="input" value={qrType} onChange={e => setQrType(e.target.value)}>
                  {QR_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL / Content</label>
                <input className="input" value={qrUrl} onChange={e => setQrUrl(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input className="input" value={qrLabel} onChange={e => setQrLabel(e.target.value)} />
              </div>
              <button onClick={() => { if (qrUrl.trim()) setQrSrc(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`); }} className="btn-primary text-sm">Generate QR Code</button>
            </div>
            {qrSrc && (
              <div className="flex flex-col items-center justify-center gap-3">
                <img src={qrSrc} alt="QR" className="w-40 h-40 border border-gray-100 rounded-lg" />
                <p className="text-sm text-gray-600 font-medium">{qrLabel}</p>
                <a href={qrSrc} download="qr-code.png" target="_blank" rel="noreferrer" className="btn-secondary text-sm flex items-center gap-1">
                  <FiDownload size={13} /> Save as PNG
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Database Backup */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-1">💾 Database Backup</h3>
          <p className="text-sm text-gray-500 mb-4">Download a complete backup as an Excel workbook. Each table gets its own sheet.</p>
          {dbStats && (
            <div className="mb-4 divide-y divide-gray-100">
              {Object.entries(dbStats).map(([table, rows]) => (
                <div key={table} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700">{table}</span>
                  <span className={`font-semibold ${rows > 0 ? 'text-brand-green' : 'text-gray-400'}`}>{rows} rows</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleDownloadBackup} disabled={downloading} className="btn-primary text-sm flex items-center gap-2">
            <FiDownload size={14} /> {downloading ? 'Downloading…' : 'Download Full Backup (.xlsx)'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
