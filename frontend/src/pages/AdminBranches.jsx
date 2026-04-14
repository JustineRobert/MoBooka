import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminBranches, createAdminBranch, updateAdminBranch } from '../api/api';

export default function AdminBranches() {
  const { token } = useAuth();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', address: '', country: '', currency: 'UGX', taxRate: 0, active: true });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await getAdminBranches(token);
        setBranches(data.branches || []);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) loadBranches();
  }, [token]);

  const resetForm = () => {
    setForm({ name: '', code: '', address: '', country: '', currency: 'UGX', taxRate: 0, active: true });
    setEditingId(null);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        const updated = await updateAdminBranch(editingId, form, token);
        setBranches((prev) => prev.map((branch) => (branch._id === editingId ? updated : branch)));
        setMessage('Branch updated successfully.');
      } else {
        const created = await createAdminBranch(form, token);
        setBranches((prev) => [created, ...prev]);
        setMessage('Branch created successfully.');
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (branch) => {
    setEditingId(branch._id);
    setForm({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      country: branch.country || '',
      currency: branch.currency || 'UGX',
      taxRate: branch.taxRate || 0,
      active: branch.active,
    });
    setMessage('');
    setError('');
  };

  return (
    <div className="card" style={{ maxWidth: 1024, margin: '0 auto' }}>
      <h1>Branch & tax configuration</h1>
      {message && <p style={{ color: '#73d677' }}>{message}</p>}
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label htmlFor="name">Branch name</label>
          <input id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
        </div>
        <div>
          <label htmlFor="code">Branch code</label>
          <input id="code" value={form.code} onChange={(e) => handleChange('code', e.target.value)} required />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input id="address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        </div>
        <div>
          <label htmlFor="country">Country</label>
          <input id="country" value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="UG" />
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <input id="currency" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} placeholder="UGX" />
        </div>
        <div>
          <label htmlFor="taxRate">Tax rate (%)</label>
          <input id="taxRate" type="number" step="0.1" value={form.taxRate} onChange={(e) => handleChange('taxRate', Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="active">Active</label>
          <select id="active" value={form.active ? 'true' : 'false'} onChange={(e) => handleChange('active', e.target.value === 'true')}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="primary">{editingId ? 'Update branch' : 'Create branch'}</button>
          {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <section>
        <h2>Configured branches</h2>
        {branches.length === 0 ? <p>No branches configured yet.</p> : (
          <div className="grid" style={{ gap: '1rem' }}>
            {branches.map((branch) => (
              <article key={branch._id} className="card" style={{ padding: '1rem' }}>
                <h3>{branch.name} ({branch.code})</h3>
                <p><strong>Address:</strong> {branch.address || 'Not specified'}</p>
                <p><strong>Country:</strong> {branch.country || 'N/A'}</p>
                <p><strong>Currency:</strong> {branch.currency || 'UGX'}</p>
                <p><strong>Tax rate:</strong> {branch.taxRate?.toFixed(1)}%</p>
                <p><strong>Status:</strong> {branch.active ? 'Active' : 'Inactive'}</p>
                <button type="button" className="secondary" onClick={() => startEdit(branch)}>Edit branch</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
