import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        console.error('Email verification error:', err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. Please try again.');
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Email Verification</h1>
        </div>

        {status === 'verifying' && (
          <div className="verify-status">
            <div className="spinner" />
            <p>Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-status">
            <div className="success-icon">✓</div>
            <div className="success-message">{message}</div>
            <p>Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-status">
            <div className="error-icon">✕</div>
            <div className="error-message">{message}</div>
            <div className="auth-footer">
              <p>
                <Link to="/login" className="link">
                  Go to login
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
