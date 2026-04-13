import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import BookLibrary from './pages/BookLibrary';
import BookDetail from './pages/BookDetail';
import AuthorUpload from './pages/AuthorUpload';
import PurchaseHistory from './pages/PurchaseHistory';
import AdminPanel from './pages/AdminPanel';
import AdminBooks from './pages/AdminBooks';
import AuthorAnalytics from './pages/AuthorAnalytics';
import Support from './pages/Support';

function App() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">MoBooka</Link>
        <nav className="nav-links">
          <Link to="/books">Books</Link>
          {user ? <Link to="/dashboard">Dashboard</Link> : null}
          {user?.role === 'author' ? <Link to="/upload">Upload</Link> : null}
          {user?.role === 'author' ? <Link to="/analytics">Analytics</Link> : null}
          {user ? <Link to="/purchases">Purchases</Link> : null}
          {user?.role === 'admin' ? <Link to="/admin">Admin</Link> : null}
          <Link to="/support">Support</Link>
          {user ? <button type="button" onClick={signOut}>Logout</button> : <Link to="/login">Login</Link>}
        </nav>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/books" />} />
          <Route path="/books" element={<BookLibrary />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/upload" element={user?.role === 'author' ? <AuthorUpload /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={user?.role === 'author' ? <AuthorAnalytics /> : <Navigate to="/login" />} />
          <Route path="/purchases" element={user ? <PurchaseHistory /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
          <Route path="/admin/books" element={user?.role === 'admin' ? <AdminBooks /> : <Navigate to="/" />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
