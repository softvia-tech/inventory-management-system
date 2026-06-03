import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Phone } from 'lucide-react';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(mobileNumber, password);
      
      // Get the updated user straight from localStorage since state might not have updated yet
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        if (storedUser.role === 'POS_ADMIN') navigate('/pos');
        else if (storedUser.role === 'INVENTORY_ADMIN') navigate('/inventory');
        else navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
      <div className="glass-panel animate-slide-up" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '600' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Sign in to Inventory & POS</p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Mobile Number"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Forgot password?</a>
          <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
