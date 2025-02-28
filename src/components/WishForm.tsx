import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import '../styles/WishForm.css';

interface WishFormProps {
  onSubmit: (wish: {
    title: string;
    description: string;
    url?: string;
    priority: 'low' | 'medium' | 'high';
  }) => void;
  onCancel: () => void;
}

const WishForm: React.FC<WishFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Set up MainButton on component mount
  useEffect(() => {
    try {
      // Configure MainButton for form submission
      WebApp.MainButton.setText('Add to Wishlist');
      WebApp.MainButton.show();
      
      const handleMainButtonClick = () => {
        if (!title || !description) {
          WebApp.showPopup({
            title: 'Required Fields',
            message: 'Please fill in both title and description fields.',
            buttons: [{
              id: "ok",
              type: "default",
              text: "OK"
            }]
          });
          return;
        }

        onSubmit({
          title,
          description,
          url: url || undefined,
          priority,
        });
      };
      
      WebApp.MainButton.onClick(handleMainButtonClick);
      
      // Clean up when component unmounts
      return () => {
        WebApp.MainButton.offClick(handleMainButtonClick);
      };
    } catch (error) {
      console.error('Error setting up MainButton in WishForm:', error);
    }
  }, [title, description, url, priority, onSubmit]);

  // Handle Cancel button
  const handleCancel = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setUrl('');
    setPriority('medium');
    
    onCancel();
  };

  return (
    <div className="wish-form-container">
      <h2>Add a New Wish</h2>
      <div className="wish-form">
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you wish for?"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about your wish"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">URL (optional)</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishForm; 