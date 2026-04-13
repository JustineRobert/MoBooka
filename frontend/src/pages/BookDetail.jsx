import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBookById, initiatePurchase, verifyPurchase, downloadBook } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function BookDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState('mtn');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookById(id).then((data) => {
      setBook(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handlePurchase = async (event) => {
    event.preventDefault();
    setError('');
    if (!user) {
      return setError('Login to purchase the book.');
    }
    try {
      const data = await initiatePurchase({ bookId: id, provider, phone }, token);
      setReference(data.reference);
      setStatus('pending');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    setError('');
    try {
      const data = await verifyPurchase({ reference }, token);
      setTransaction(data.transaction);
      setStatus(data.verification.status);
      if (data.verification.status === 'success') {
        const downloadData = await downloadBook(id, data.transaction.downloadToken, token);
        setDownloadLink(downloadData.fileUrl);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="card"><p>Loading book details...</p></div>;
  if (!book) return <div className="card"><p>Book not found.</p></div>;

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <Link to="/books" className="secondary" style={{ marginBottom: 12, display: 'inline-block' }}>&larr; Back to library</Link>
      <div className="grid grid-2">
        <div>
          <h1>{book.title}</h1>
          <p>{book.description}</p>
          <p><strong>Authors:</strong> {book.authors?.join(', ')}</p>
          <p><strong>Category:</strong> {book.category}</p>
          <p><strong>Price:</strong> {book.price === 0 ? 'Free' : `$${book.price}`}</p>
          <p><strong>Status:</strong> {book.status}</p>
        </div>
        {book.coverUrl && <img src={book.coverUrl} alt={book.title} style={{ width: '100%', borderRadius: 16 }} />}
      </div>

      {book.price > 0 ? (
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Purchase with Mobile Money</h2>
          <form onSubmit={handlePurchase} className="grid" style={{ gap: '1rem' }}>
            <div className="form-group"><label>Provider</label><select value={provider} onChange={(e) => setProvider(e.target.value)}><option value="mtn">MTN MoMo</option><option value="airtel">Airtel Money</option></select></div>
            <div className="form-group"><label>Phone number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +256771234567" required /></div>
            <button type="submit" className="primary">Initiate payment</button>
          </form>
          {reference ? <p>Payment reference: <strong>{reference}</strong></p> : null}
          {reference && status === 'pending' ? <button type="button" onClick={handleVerify} className="secondary">Verify payment</button> : null}
          {downloadLink ? (
            <p><a href={downloadLink} className="primary">Download your book</a></p>
          ) : null}
          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Free download</h2>
          <p>This book is free. Add it to your library after login.</p>
        </div>
      )}
    </div>
  );
}
