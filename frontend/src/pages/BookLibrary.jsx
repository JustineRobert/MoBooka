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
    <div className="page-shell">
      <section className="hero-section">
        <div>
          <span className="eyebrow">Discover + connect</span>
          <h1>Find stories that move Africa forward.</h1>
          <p>MoBooka brings you books from African authors, built for mobile wallets, secure downloads, and community growth.</p>
          <div className="hero-actions">
            <Link to="/books" className="button primary">Browse books</Link>
            <Link to="/contact" className="button secondary">Contact us</Link>
          </div>
        </div>
        <div className="hero-card card">
          <h2>Need help with payment or uploads?</h2>
          <p>Reach our support team directly and get fast assistance for account issues, author onboarding, and Mobile Money payments.</p>
          <Link to="/contact" className="button primary">Contact support</Link>
        </div>
      </section>

      <div className="card">
        <h2>Browse MoBooka</h2>
        <p>Mobile-first digital books built for African readers and authors.</p>
        {loading ? <p>Loading books...</p> : (
          <div className="grid grid-2">
            {books.length === 0 ? <p>No books published yet.</p> : books.map((book) => (
              <article key={book._id} className="card" style={{ padding: '1rem' }}>
                <h3>{book.title}</h3>
                <p>{book.description?.slice(0, 115)}...</p>
                <p><strong>Category:</strong> {book.category}</p>
                <p><strong>Price:</strong> {book.price === 0 ? 'Free' : `$${book.price}`}</p>
                <Link to={`/books/${book._id}`} className="secondary">View details</Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
