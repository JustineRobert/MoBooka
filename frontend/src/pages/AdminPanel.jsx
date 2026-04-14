import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authorizedRequest } from '../api/api';

export default function AdminPanel() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await authorizedRequest('/admin/reports', token);
        setReport(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (token) loadReport();
  }, [token]);

  return (
    <div className="card" style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1>Admin panel</h1>
      {error ? <p style={{ color: '#ff6b6b' }}>{error}</p> : null}
      {!report ? <p>Loading metrics...</p> : (
        <>
          <div className="grid grid-2">
            <div className="card"><h3>Total Users</h3><p>{report.totalUsers}</p></div>
            <div className="card"><h3>Total Books</h3><p>{report.totalBooks}</p></div>
            <div className="card"><h3>Total Revenue</h3><p>${report.revenue?.toFixed(2)}</p></div>
            <div className="card"><h3>Total Commission</h3><p>${report.commission?.toFixed(2)}</p></div>
          </div>
          <div className="grid grid-2" style={{ gap: '1rem', marginTop: '1rem' }}>
            <div className="card"><h3>Branch management</h3><p>Configure business branches, currency handling, and tax rates.</p><a href="/admin/branches" className="secondary">Open branch settings</a></div>
            <div className="card"><h3>Pending approvals</h3><p>Approve or reject newly uploaded books.</p><a href="/admin/books" className="secondary">Open book approvals</a></div>
          </div>
        </>
      )}
    </div>
  );
}
