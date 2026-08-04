import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock } from 'react-icons/md';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '8px' }}>Assure <span style={{color: 'var(--text-main)'}}>DronePartner</span></h2>
          <p className="text-muted">Welcome back! Please login to your account.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <MdEmail style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '1.2rem' }} />
              <input type="email" className="form-control" placeholder="dronePartner@assure.com" style={{ paddingLeft: '48px' }} required />
            </div>
          </div>

          <div className="form-group mb-4">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              <a href="#" className="text-primary" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Forgot Password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <MdLock style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '1.2rem' }} />
              <input type="password" className="form-control" placeholder="••••••••" style={{ paddingLeft: '48px' }} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" style={{ padding: '14px', fontSize: '1rem', borderRadius: '12px' }}>
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
