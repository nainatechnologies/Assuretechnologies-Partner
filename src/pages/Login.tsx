import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import API from '../services/api';
import { loginUser } from '../services/auth';
import { MdEmail, MdLock } from 'react-icons/md';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    API.post('/auth/partner/login', { email, password })
      .then((res) => {
        if (res.data.success) {
          loginUser(res.data.data.user);
          Swal.fire({
            title: 'Success!',
            text: 'Logged in successfully!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/dashboard');
          });
        }
      })
      .catch((err) => {
        console.error('Login Error:', err);
        Swal.fire({
          title: 'Login Failed',
          text: err.response?.data?.message || 'Invalid credentials',
          icon: 'error',
          confirmButtonColor: '#EF4444'
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '8px' }}>Assure <span style={{color: 'var(--text-main)'}}>Partner</span></h2>
          <p className="text-muted">Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '1.2rem' }} />
              <input type="email" className="form-control" placeholder="partner@assure.com" style={{ paddingLeft: '48px' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '1.2rem' }} />
              <input type="password" className="form-control" placeholder="••••••••" style={{ paddingLeft: '48px' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" style={{ padding: '14px', fontSize: '1rem', borderRadius: '12px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
