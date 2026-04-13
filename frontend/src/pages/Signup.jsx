import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await register({ name, email, password, role });
      signIn({ user: { name, email, role }, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 540, margin: '0 auto' }}>
      <h1>Create account</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="form-group"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
        <div className="form-group"><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></div>
        <div className="form-group"><label>Role</label><select value={role} onChange={(e) => setRole(e.target.value)}><option value="reader">Reader</option><option value="author">Author / Publisher</option></select></div>
        {error ? <div style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</div> : null}
        <button type="submit" className="primary">Sign up</button>
      </form>
      <p style={{ marginTop: 16 }}>Already have account? <Link to="/login">Login</Link>.</p>
    </div>
  );
}
