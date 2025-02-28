import React, { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      WebApp.showPopup({
        title: 'Required Fields',
        message: 'Please fill in both title and description fields.',
        buttons: [
          {
            id: "ok",
            type: "default",
            text: "OK"
          }
        ]
      });
      return;
    }

    onSubmit({
      title,
      description,
      url: url || undefined,
      priority,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setUrl('');
    setPriority('medium');
  };

  return (
    <div className="wish-form-container">
      <h2>Add a New Wish</h2>
      <form onSubmit={handleSubmit} className="wish-form">
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
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Add to Wishlist
          </button>
        </div>
      </form>
    </div>
  );
};

export default WishForm; 