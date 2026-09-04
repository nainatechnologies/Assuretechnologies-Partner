import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<'LOGIN' | 'SET_PASSWORD'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isMobile = /^\d+$/.test(email);
        const payload = isMobile ? { mobile: email, password } : { email: email, password };
        const response = await api.post('/auth/partner/login', payload);

      if (response.data.success) {
        if (response.data.requiresPasswordChange) {
          toast.info('Password Reset Required: Please set a new secure password for your first-time login.');
          setStep('SET_PASSWORD');
          return;
        }

        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        toast.success('Success! You have successfully logged in.');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }
    if (newPassword === password) {
      setError('New password cannot be the same as the old password');
      return;
    }

    setLoading(true);

    try {
      const isMobile = /^\d+$/.test(email);
        const payload = isMobile ? { mobile: email, old_password: password, new_password: newPassword, confirm_password: confirmPassword } : { email: email, old_password: password, new_password: newPassword, confirm_password: confirmPassword };
        const response = await api.post('/auth/partner/set-password', payload);

      if (response.data.success) {
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        toast.success('Password Updated! Your password has been changed successfully.');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to update password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--primary, #4F46E5)', fontSize: '2rem', marginBottom: '8px' }}>Assure <span style={{color: 'var(--text-main, #1f2937)'}}>DronePartner</span></h2>
          <p className="text-muted" style={{ color: '#6b7280' }}>
            {step === 'LOGIN' ? 'Welcome back! Please login to your account.' : 'Create a new password for your account'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', marginBottom: '20px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {step === 'LOGIN' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Email or Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <MdEmail style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.2rem' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="dronePartner@assure.com" 
                  style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontWeight: 500, color: '#374151' }}>Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ color: '#4F46E5', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.2rem' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px', background: '#4F46E5', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetNewPassword}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Email or Mobile Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={email}
                disabled
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#6b7280', boxSizing: 'border-box', cursor: 'not-allowed' }} 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.2rem' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Min. 8 chars" 
                  style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.2rem' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Re-enter new password" 
                  style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setStep('LOGIN')}
                style={{ flex: 1, padding: '14px', fontSize: '1rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer', fontWeight: 600 }}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ flex: 2, padding: '14px', fontSize: '1rem', borderRadius: '12px', background: '#4F46E5', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                {loading ? 'Saving...' : 'Set Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;





