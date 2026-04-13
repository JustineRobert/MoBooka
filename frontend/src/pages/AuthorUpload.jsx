import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBook } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function AuthorUpload() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', authors: '', category: '', description: '', tags: '', price: '', status: 'draft' });
  const [cover, setCover] = useState(null);
  const [file, setFile] = useState(null);
  const [sample, setSample] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (cover) payload.append('cover', cover);
      if (file) payload.append('file', file);
      if (sample) payload.append('sample', sample);
      await createBook(payload, token);
      setMessage('Book uploaded successfully. Awaiting admin approval.');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
      <h1>Upload a new book</h1>
      <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
        <div className="form-group"><label>Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
        <div className="form-group"><label>Authors</label><input name="authors" value={form.authors} onChange={handleChange} placeholder="Comma-separated authors" required /></div>
        <div className="form-group"><label>Category</label><input name="category" value={form.category} onChange={handleChange} required /></div>
        <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows="5" /></div>
        <div className="form-group"><label>Tags</label><input name="tags" value={form.tags} onChange={handleChange} placeholder="Comma-separated tags" /></div>
        <div className="form-group"><label>Price (USD)</label><input name="price" value={form.price} onChange={handleChange} type="number" min="0" step="0.01" required /></div>
        <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option value="draft">Draft</option><option value="pending">Pending approval</option></select></div>
        <div className="form-group"><label>Cover image</label><input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0])} /></div>
        <div className="form-group"><label>Book file</label><input type="file" accept="application/pdf,application/epub+zip,.epub" onChange={(e) => setFile(e.target.files[0])} required /></div>
        <div className="form-group"><label>Sample file</label><input type="file" accept="application/pdf,application/epub+zip,.epub" onChange={(e) => setSample(e.target.files[0])} /></div>
        <button type="submit" className="primary">Upload book</button>
      </form>
      {message && <p style={{ color: '#73d677' }}>{message}</p>}
      {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
    </div>
  );
}
