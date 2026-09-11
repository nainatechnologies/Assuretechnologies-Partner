import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { resetPassword, requestPasswordResetOtp } from '../services/auth';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMobile = location.state?.mobile || '';
  const startCountdown = location.state?.startCountdown || false;

  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(startCountdown ? 30 : 0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendOtp = async () => {
    try {
      const data = await requestPasswordResetOtp(mobile);
      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        title: data.message || 'OTP resent successfully',
        icon: 'success'
      });
      setCountdown(30);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match!',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    if (newPassword.length < 8) {
      Swal.fire({
        title: 'Error!',
        text: 'New password must be at least 8 characters long',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await resetPassword({ mobile, otp, newPassword });
      
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Password reset successfully',
        icon: 'success',
        confirmButtonColor: '#4F46E5',
        timer: 2000
      }).then(() => {
        navigate('/');
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
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
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.5' }}>
          Enter the OTP and your new password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="mobile" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Mobile Number</label>
            <input
              type="text"
              id="mobile"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none', backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              readOnly={!!initialMobile}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="otp" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>6-digit OTP</label>
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={countdown > 0}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  color: countdown > 0 ? '#9ca3af' : '#4F46E5'
                }}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
            <input
              type="text"
              id="otp"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '14px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', boxSizing: 'border-box', fontSize: '14px', outline: 'none' }}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '14px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <button 
              type="submit" 
              disabled={isLoading} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: '#4F46E5', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '15px', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
