import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, UserPlus } from 'lucide-react';
import { fetchApi } from '../services/api';

const Signup = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ mobileNumber, password }),
      });
      setSuccess(response.message || 'Account created! Pending admin approval.');
      setMobileNumber('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
      <div className="glass-panel animate-slide-up" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '600' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Request access to IMS Pro</p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Phone size={18} style={{ position: 'absolute', top: '12px', left: '14px', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Mobile Number (10 digits)"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              pattern="\d{10}"
              title="Must be exactly 10 digits"
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
              minLength="4"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={isLoading}>
            <UserPlus size={18} /> {isLoading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
