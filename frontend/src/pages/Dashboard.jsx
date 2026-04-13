import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1>Welcome, {user?.name || 'MoBooka user'}</h1>
      <p>Your role: <strong>{user?.role}</strong></p>
      <div className="grid grid-2" style={{ gap: '1rem' }}>
        <section className="card">
          <h2>Reader dashboard</h2>
          <p>Browse, purchase, and download books with mobile money.</p>
          <Link to="/books" className="secondary">Browse books</Link>
          <Link to="/purchases" className="secondary">View purchases</Link>
        </section>
        {user?.role === 'author' && (
          <section className="card">
            <h2>Author dashboard</h2>
            <p>Upload books, manage drafts, and track pending approvals.</p>
            <Link to="/upload" className="primary">Upload a book</Link>
          </section>
        )}
        {user?.role === 'admin' && (
          <section className="card">
            <h2>Admin dashboard</h2>
            <p>Approve uploads, manage users, and monitor platform revenue.</p>
            <Link to="/admin/books" className="primary">Review pending books</Link>
          </section>
        )}
      </div>
    </div>
  );
}
