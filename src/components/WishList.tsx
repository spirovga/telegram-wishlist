import React from 'react';
import '../styles/WishList.css';

interface WishItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  priority: 'low' | 'medium' | 'high';
}

interface WishListProps {
  items: WishItem[];
  onRemove?: (id: string) => void;
}

const WishList: React.FC<WishListProps> = ({ items, onRemove }) => {
  const getPriorityClass = (priority: WishItem['priority']) => {
    return `priority-${priority}`;
  };

  if (items.length === 0) {
    return null;
  }

  const isSharedList = !onRemove;

  return (
    <div className="wish-list">
      <h2>Wishes</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={`wish-item ${getPriorityClass(item.priority)}`}>
            <div className="wish-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  View Item
                </a>
              )}
              <span className="priority-badge">
                Priority: {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </span>
            </div>
            {!isSharedList && (
              <button 
                className="delete-button" 
                onClick={() => onRemove?.(item.id)}
                aria-label="Delete item"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      {isSharedList && (
        <div className="shared-list-notice">
          <p>This is a shared wishlist - you're viewing it in read-only mode.</p>
        </div>
      )}
    </div>
  );
};

export default WishList; 