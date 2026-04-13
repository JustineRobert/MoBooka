import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReceipt } from '../api/api';

export default function Receipt() {
  const { id } = useParams();
  const { token } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getReceipt(id, token)
      .then((data) => setReceipt(data.transaction))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="card"><p>Loading receipt...</p></div>;
  if (error) return <div className="card"><p style={{ color: '#ff6b6b' }}>{error}</p></div>;
  if (!receipt) return <div className="card"><p>Receipt not found.</p></div>;

  return (
    <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Receipt</h1>
          <p>Transaction ID: {receipt._id}</p>
        </div>
        <div>
          <button type="button" className="secondary" onClick={handlePrint}>Print receipt</button>
          <Link to="/purchases" className="secondary" style={{ marginLeft: 8 }}>Back to history</Link>
        </div>
      </div>

      <section className="card" style={{ padding: '1.5rem', marginBottom: 16 }}>
        <h2>Transaction details</h2>
        <p><strong>Receipt number:</strong> {receipt.receiptNumber || 'N/A'}</p>
        <p><strong>Reference:</strong> {receipt.reference}</p>
        <p><strong>Status:</strong> {receipt.status}</p>
        <p><strong>Provider:</strong> {receipt.provider}</p>
        <p><strong>Amount:</strong> ${receipt.amount.toFixed(2)}</p>
        <p><strong>Commission:</strong> ${receipt.commission.toFixed(2)}</p>
        <p><strong>Paid at:</strong> {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : 'Pending'}</p>
      </section>

      <section className="card" style={{ padding: '1.5rem', marginBottom: 16 }}>
        <h2>Book</h2>
        <p><strong>Title:</strong> {receipt.book?.title}</p>
        <p><strong>Category:</strong> {receipt.book?.category}</p>
        <p><strong>Price:</strong> ${receipt.book?.price?.toFixed(2) || '0.00'}</p>
      </section>

      <section className="card" style={{ padding: '1.5rem' }}>
        <h2>Buyer</h2>
        <p><strong>Name:</strong> {receipt.buyer?.name}</p>
        <p><strong>Email:</strong> {receipt.buyer?.email}</p>
        <p><strong>Phone:</strong> {receipt.buyer?.phone || 'Not provided'}</p>
      </section>
    </div>
  );
}
