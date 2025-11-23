import React from 'react';

function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  const sizeMap = {
    small: { spinner: '24px', fontSize: '0.875rem' },
    medium: { spinner: '42px', fontSize: '1rem' },
    large: { spinner: '60px', fontSize: '1.125rem' }
  };

  const styles = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px'
    }}>
      <div style={{
        width: styles.spinner,
        height: styles.spinner,
        borderRadius: '50%',
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: '#29a867',
        animation: 'spin 0.9s linear infinite'
      }} />
      <p style={{
        margin: 0,
        color: '#95a59a',
        fontSize: styles.fontSize,
        fontWeight: '500'
      }}>
        {message}
      </p>
    </div>
  );
}

export default LoadingSpinner;
