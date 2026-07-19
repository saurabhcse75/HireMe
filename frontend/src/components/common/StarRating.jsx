import React, { useState } from 'react';

const StarRating = ({ value = 0, onChange, size = 'md', readonly = false }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: { star: 20, gap: 4 },
    md: { star: 28, gap: 6 },
    lg: { star: 40, gap: 8 },
  };

  const { star: starSize, gap } = sizes[size] || sizes.md;

  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap, cursor: readonly ? 'default' : 'pointer' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoverValue || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => !readonly && onChange?.(star)}
              onMouseEnter={() => !readonly && setHoverValue(star)}
              onMouseLeave={() => !readonly && setHoverValue(0)}
              disabled={readonly}
              style={{
                background: 'none',
                border: 'none',
                padding: 2,
                cursor: readonly ? 'default' : 'pointer',
                transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive && !readonly ? 'scale(1.15)' : 'scale(1)',
                filter: isActive ? 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.5))' : 'none',
              }}
              aria-label={`Rate ${star} stars`}
            >
              <svg
                width={starSize}
                height={starSize}
                viewBox="0 0 24 24"
                fill={isActive ? '#facc15' : 'none'}
                stroke={isActive ? '#eab308' : '#d1d5db'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'all 200ms ease' }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
      </div>
      {!readonly && size === 'lg' && (hoverValue || value) > 0 && (
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#ca8a04',
          marginTop: 8,
          opacity: 0.8,
        }}>
          {labels[(hoverValue || value) - 1]}
        </p>
      )}
    </div>
  );
};

export default StarRating;
