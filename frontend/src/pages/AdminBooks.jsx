import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminBooks, updateBookStatus } from '../api/api';

export default function AdminBooks() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminBooks(token).then((data) => setBooks(data.books)).catch((err) => setError(err.message));
  }, [token]);

  const handleStatus = async (bookId, status) => {
    setError('');
    try {
      await updateBookStatus(bookId, status, token);
      setBooks((prev) => prev.filter((book) => book._id !== bookId));
      setMessage(`Book ${status} successfully`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1>Pending book approvals</h1>
      {message && <p style={{ color: '#73d677' }}>{message}</p>}
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
      {books.length === 0 ? <p>No pending book uploads.</p> : (
        <div className="grid" style={{ gap: '1rem' }}>
          {books.map((book) => (
            <article key={book._id} className="card" style={{ padding: '1rem' }}>
              <h2>{book.title}</h2>
              <p>{book.description?.slice(0, 120)}...</p>
              <p><strong>Author:</strong> {book.author?.name}</p>
              <p><strong>Price:</strong> ${book.price}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" className="primary" onClick={() => handleStatus(book._id, 'published')}>Approve</button>
                <button type="button" className="secondary" onClick={() => handleStatus(book._id, 'draft')}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
