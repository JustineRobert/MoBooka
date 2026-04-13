import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await login({ email, password });
      signIn(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
        <div className="form-group"><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></div>
        {error ? <div style={{ color: '#ff6b6b', marginBottom: 12 }}>{error}</div> : null}
        <button type="submit" className="primary">Sign in</button>
      </form>
      <p style={{ marginTop: 16 }}>New? <Link to="/signup">Create an account</Link>.</p>
    </div>
  );
}
