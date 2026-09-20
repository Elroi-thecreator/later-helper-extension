import React from 'react';
import { PageCategory } from '../models/SavedPage';

const CATEGORY_COLORS: Record<PageCategory, { bg: string; text: string }> = {
  Shopping: { bg: '#e0e7ff', text: '#3730a3' },
  Food: { bg: '#fef3c7', text: '#92400e' },
  Travel: { bg: '#ccfbf1', text: '#115e59' },
  Learning: { bg: '#ede9fe', text: '#5b21b6' },
  Video: { bg: '#fee2e2', text: '#991b1b' },
  Jobs: { bg: '#e0f2fe', text: '#075985' },
  News: { bg: '#f1f5f9', text: '#334155' },
  Technology: { bg: '#dcfce7', text: '#166534' },
  Social: { bg: '#fce7f3', text: '#831843' },
  Other: { bg: '#f3f4f6', text: '#4b5563' }
};

export const CategoryBadge: React.FC<{ category: PageCategory }> = ({ category }) => {
  const style = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '10px',
        fontWeight: 600,
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: style.bg,
        color: style.text,
        textTransform: 'uppercase',
        letterSpacing: '0.4px'
      }}
    >
      {category}
    </span>
  );
};