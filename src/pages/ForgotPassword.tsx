import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordResetOtp } from '../services/auth';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: 'Please enter your mobile number',
        icon: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestPasswordResetOtp(mobile);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: data.message || 'OTP sent successfully',
        icon: 'success'
      });

      navigate('/reset-password', { state: { mobile, startCountdown: true } });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: message,
        icon: 'error'
      });
      
      if (error.response?.status === 429) {
        setCountdown(30);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#4F46E5', borderRadius: '12px' }}></div>
        </div>
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' }}>Forgot Password</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.5' }}>
          Enter your registered mobile number to receive an OTP.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="mobile" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Mobile Number</label>
            <input
              type="text"
              id="mobile"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              disabled={countdown > 0}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              type="submit" 
              disabled={isLoading || countdown > 0} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: countdown > 0 ? '#9ca3af' : '#4F46E5', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '15px', 
                fontWeight: 600, 
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isLoading ? 'Sending...' : countdown > 0 ? `Please wait ${countdown}s...` : 'Send OTP'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: '#4F46E5', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
