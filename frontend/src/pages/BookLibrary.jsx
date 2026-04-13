import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBooks } from '../api/api';

export default function BookLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks().then((data) => {
      setBooks(data.books || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h1>Browse MoBooka</h1>
      <p>Mobile-first digital books built for African readers and authors.</p>
      {loading ? <p>Loading books...</p> : (
        <div className="grid grid-2">
          {books.length === 0 ? <p>No books published yet.</p> : books.map((book) => (
            <article key={book._id} className="card" style={{ padding: '1rem' }}>
              <h2>{book.title}</h2>
              <p>{book.description?.slice(0, 115)}...</p>
              <p><strong>Category:</strong> {book.category}</p>
              <p><strong>Price:</strong> {book.price === 0 ? 'Free' : `$${book.price}`}</p>
              <Link to={`/books/${book._id}`} className="secondary">View details</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
