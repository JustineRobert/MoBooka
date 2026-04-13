import { useEffect, useState } from 'react';
import { getAuthorAnalytics } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function AuthorAnalytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getAuthorAnalytics(token)
      .then((data) => setAnalytics(data))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="card" style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1>Author analytics</h1>
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      {!analytics ? (
        <p>Loading your sales and earnings...</p>
      ) : (
        <>
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            <section className="card"><h3>Total revenue</h3><p>${analytics.totalRevenue?.toFixed(2) || '0.00'}</p></section>
            <section className="card"><h3>Total book sales</h3><p>{analytics.sales?.length || 0}</p></section>
          </div>
          <section className="card" style={{ marginTop: '1rem' }}>
            <h2>Recent sales</h2>
            {analytics.sales.length === 0 ? (
              <p>No successful sales yet.</p>
            ) : (
              <div className="grid" style={{ gap: '1rem' }}>
                {analytics.sales.map((tx) => (
                  <article key={tx._id} className="card" style={{ padding: '1rem' }}>
                    <h3>{tx.book?.title}</h3>
                    <p><strong>Amount:</strong> ${tx.amount.toFixed(2)}</p>
                    <p><strong>Commission:</strong> ${tx.commission.toFixed(2)}</p>
                    <p><strong>Net earnings:</strong> ${(tx.amount - tx.commission).toFixed(2)}</p>
                    <p><strong>Sold on:</strong> {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
