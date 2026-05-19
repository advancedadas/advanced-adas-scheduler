import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('admin@advancedadas.com.au');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault(); setError('');
    try { await login(email, password); } catch { setError('Invalid email or password'); }
  }

  return <div className="login-page"><form className="login-card" onSubmit={submit}><div className="brand large"><span className="brand-mark">ADAS</span><div><strong>Advanced ADAS</strong><small>Secure job scheduling</small></div></div><h1>Login</h1>{error && <p className="error">{error}</p>}<label>Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label><label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label><button>Sign in</button></form></div>;
}
