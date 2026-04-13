import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPurchaseHistory, downloadBook } from '../api/api';

export default function PurchaseHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getPurchaseHistory(token).then((data) => setHistory(data.history)).catch((err) => setError(err.message));
  }, [token]);

  const handleDownload = async (bookId, downloadToken) => {
    setError('');
    try {
      const data = await downloadBook(bookId, downloadToken, token);
      window.open(data.fileUrl, '_blank');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>Purchase history</h1>
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      {history.length === 0 ? <p>No purchases yet.</p> : (
        <div className="grid" style={{ gap: '1rem' }}>
          {history.map((tx) => (
            <article key={tx._id} className="card" style={{ padding: '1rem' }}>
              <h2>{tx.book?.title}</h2>
              <p><strong>Amount:</strong> ${tx.amount.toFixed(2)}</p>
              <p><strong>Status:</strong> {tx.status}</p>
              <p><strong>Provider:</strong> {tx.provider}</p>
              {tx.status === 'success' && tx.downloadToken ? (
                <button type="button" className="primary" onClick={() => handleDownload(tx.book._id, tx.downloadToken)}>Download book</button>
              ) : null}
            </article>
          ))}
        </div>
      )}
      {message && <p style={{ color: '#73d677' }}>{message}</p>}
    </div>
  );
}
