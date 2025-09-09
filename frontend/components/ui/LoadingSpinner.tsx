import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text,
  className = ''
}) => {
  const sizeMap = {
    small: '24px',
    medium: '32px',
    large: '40px'
  };

  const borderWidth = size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px';

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .spinner-${size} {
            animation: spin 1s linear infinite !important;
            -webkit-animation: spin 1s linear infinite !important;
            -moz-animation: spin 1s linear infinite !important;
            -o-animation: spin 1s linear infinite !important;
            -ms-animation: spin 1s linear infinite !important;
          }
        `}
      </style>
      <div className={`loading-spinner-container ${className}`} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: text ? '12px' : '0',
        height: '100%',
        width: '100%'
      }}>
        <div 
          className={`spinner-${size}`}
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            border: `${borderWidth} solid #e5e7eb`,
            borderTop: `${borderWidth} solid #000000`,
            borderRadius: '50%',
            margin: '0 !important',
            padding: '0 !important',
            display: 'block !important'
          }}
        />
        {text && (
          <p style={{
            fontSize: '14px',
            margin: 0,
            fontFamily: "'Lufga', system-ui, sans-serif",
            color: '#6b7280',
            textAlign: 'center'
          }}>
            {text}
          </p>
        )}
      </div>
    </>
  );
};

export default LoadingSpinner;
