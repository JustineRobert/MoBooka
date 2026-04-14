import { useEffect, useState } from 'react';
import { getAuthorAnalytics, getAnalyticsForecast } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function AuthorAnalytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    Promise.all([getAuthorAnalytics(token), getAnalyticsForecast(token)])
      .then(([analyticsData, forecastData]) => {
        setAnalytics(analyticsData);
        setForecast(forecastData);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const exportCsv = () => {
    if (!analytics) return;
    const rows = [
      ['Book title', 'Amount', 'Commission', 'Net earnings', 'Sold on', 'Branch'],
      ...analytics.sales.map((tx) => [
        tx.book?.title || 'Unknown',
        tx.amount.toFixed(2),
        tx.commission.toFixed(2),
        (tx.amount - tx.commission).toFixed(2),
        new Date(tx.createdAt).toLocaleDateString(),
        tx.branch?.code || 'MAIN',
      ]),
    ];
    const csv = rows.map((row) => row.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'author-analytics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    if (!analytics) return;
    const payload = JSON.stringify({ analytics, forecast }, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'author-analytics.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

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
          {forecast && (
            <section className="card" style={{ marginTop: '1rem' }}>
              <h2>Demand forecast</h2>
              <p>{forecast.forecastHint}</p>
              <div className="grid grid-3" style={{ gap: '1rem' }}>
                {forecast.demandByCategory.map((item) => (
                  <article key={item.category} className="card" style={{ padding: '1rem' }}>
                    <h3>{item.category}</h3>
                    <p><strong>Recent sales:</strong> {item.sales}</p>
                    <p><strong>Forecast:</strong> {item.forecast} next month</p>
                    <p><strong>Revenue:</strong> ${item.revenue.toFixed(2)}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
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
                    <p><strong>Branch:</strong> {tx.branch?.code || 'MAIN'}</p>
                    <p><strong>Sold on:</strong> {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={exportCsv}>Export analytics CSV</button>
            <button type="button" onClick={exportJson}>Export analytics JSON</button>
          </div>
        </>
      )}
    </div>
  );
}
