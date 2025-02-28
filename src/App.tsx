import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import WishList from './components/WishList';
import WishForm from './components/WishForm';
import './styles/App.css';

interface WishItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  priority: 'low' | 'medium' | 'high';
}

const App: React.FC = () => {
  const [wishItems, setWishItems] = useState<WishItem[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [wishlistId, setWishlistId] = useState<string>('');

  // Initialize wishlist ID or load from URL param
  useEffect(() => {
    try {
      // Check if there's a wishlist ID in the URL (for sharing)
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get('id');
      
      if (idFromUrl) {
        // Load shared wishlist from localStorage if exists
        const savedItems = localStorage.getItem(`wishlist_${idFromUrl}`);
        if (savedItems) {
          setWishItems(JSON.parse(savedItems));
          setWishlistId(idFromUrl);
        }
      } else {
        // Create a new wishlist ID if none exists
        const newId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        setWishlistId(newId);
      }
    } catch (error) {
      console.error('Error initializing wishlist:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlistId && wishItems.length > 0) {
      localStorage.setItem(`wishlist_${wishlistId}`, JSON.stringify(wishItems));
    }
  }, [wishItems, wishlistId]);

  useEffect(() => {
    // Set Telegram main button for adding a wish
    try {
      WebApp.MainButton.setText('Add Wish');
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(() => setIsFormVisible(true));
      
      return () => {
        WebApp.MainButton.hide();
        WebApp.MainButton.offClick();
      };
    } catch (error) {
      console.error('Error initializing Telegram MainButton:', error);
      return () => {};
    }
  }, []);

  // Make sure the Telegram MainButton is visible when returning from the form
  useEffect(() => {
    if (!isFormVisible) {
      try {
        WebApp.MainButton.show();
      } catch (error) {
        console.error('Error showing MainButton:', error);
      }
    }
  }, [isFormVisible]);

  const addWishItem = (item: Omit<WishItem, 'id'>) => {
    const newItem: WishItem = {
      ...item,
      id: Date.now().toString(),
    };
    setWishItems([...wishItems, newItem]);
    setIsFormVisible(false);
  };

  const removeWishItem = (id: string) => {
    setWishItems(wishItems.filter(item => item.id !== id));
  };

  const shareWishlist = () => {
    try {
      // Generate shareable URL with wishlist ID
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${wishlistId}`;
      
      // Use Telegram's native sharing if available
      if (WebApp.isExpanded) {
        WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my wishlist!')}`);
      } else {
        // Fallback to clipboard copy
        navigator.clipboard.writeText(shareUrl);
        alert('Shareable link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Wishlist</h1>
        {wishlistId && (
          <div className="wishlist-id">
            ID: {wishlistId}
            <button className="share-button" onClick={shareWishlist}>
              Share
            </button>
          </div>
        )}
      </header>
      
      <main>
        {isFormVisible ? (
          <WishForm onSubmit={addWishItem} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <>
            <WishList items={wishItems} onRemove={removeWishItem} />
            {wishItems.length === 0 && (
              <div className="empty-state">
                <p>Your wishlist is empty. Tap the main blue button at the bottom of your screen to add items.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App; 