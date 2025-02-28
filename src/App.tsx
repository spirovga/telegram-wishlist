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
  const [isSharedWishlist, setIsSharedWishlist] = useState(false);

  // Initialize wishlist ID or load from URL param
  useEffect(() => {
    try {
      // Check if there's a wishlist ID and data in the URL (for sharing)
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get('id');
      const dataFromUrl = urlParams.get('data');
      
      if (idFromUrl) {
        if (dataFromUrl) {
          // Load wishlist from URL data parameter
          try {
            const decodedData = JSON.parse(atob(dataFromUrl));
            setWishItems(decodedData);
            setWishlistId(idFromUrl);
            setIsSharedWishlist(true);
          } catch (e) {
            console.error('Error parsing shared wishlist data:', e);
          }
        } else {
          // Load shared wishlist from localStorage if exists
          const savedItems = localStorage.getItem(`wishlist_${idFromUrl}`);
          if (savedItems) {
            setWishItems(JSON.parse(savedItems));
            setWishlistId(idFromUrl);
          }
        }
      } else {
        // Create a new wishlist ID if none exists
        const newId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
        setWishlistId(newId);
        
        // Load from localStorage if exists
        const savedItems = localStorage.getItem(`wishlist_${newId}`);
        if (savedItems) {
          setWishItems(JSON.parse(savedItems));
        }
      }
    } catch (error) {
      console.error('Error initializing wishlist:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlistId && wishItems.length > 0 && !isSharedWishlist) {
      localStorage.setItem(`wishlist_${wishlistId}`, JSON.stringify(wishItems));
    }
  }, [wishItems, wishlistId, isSharedWishlist]);

  useEffect(() => {
    // Set Telegram main button for adding a wish
    try {
      // Only show add button if not viewing a shared wishlist
      if (!isSharedWishlist) {
        WebApp.MainButton.setText('Add Wish');
        WebApp.MainButton.show();
        WebApp.MainButton.onClick(() => setIsFormVisible(true));
      } else {
        WebApp.MainButton.hide();
      }
      
      return () => {
        WebApp.MainButton.hide();
        WebApp.MainButton.offClick();
      };
    } catch (error) {
      console.error('Error initializing Telegram MainButton:', error);
      return () => {};
    }
  }, [isSharedWishlist]);

  // Make sure the Telegram MainButton is visible when returning from the form
  useEffect(() => {
    if (!isFormVisible && !isSharedWishlist) {
      try {
        WebApp.MainButton.show();
      } catch (error) {
        console.error('Error showing MainButton:', error);
      }
    }
  }, [isFormVisible, isSharedWishlist]);

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
      // Encode wishlist data as base64 for sharing
      const encodedData = btoa(JSON.stringify(wishItems));
      
      // Generate shareable URL with wishlist ID and data
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${wishlistId}&data=${encodedData}`;
      
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

  // Create your own copy of a shared wishlist
  const createMyWishlist = () => {
    // Create a new wishlist ID
    const newId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    setWishlistId(newId);
    setIsSharedWishlist(false);
    
    // Save current items to localStorage with new ID
    localStorage.setItem(`wishlist_${newId}`, JSON.stringify(wishItems));
    
    // Remove URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Show the add button
    try {
      WebApp.MainButton.setText('Add Wish');
      WebApp.MainButton.show();
    } catch (error) {
      console.error('Error showing MainButton:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          {isSharedWishlist ? "Shared Wishlist" : "My Wishlist"}
        </h1>
        {wishlistId && (
          <div className="wishlist-id">
            ID: {wishlistId}
            {isSharedWishlist ? (
              <button className="share-button" onClick={createMyWishlist}>
                Create My Copy
              </button>
            ) : (
              <button className="share-button" onClick={shareWishlist}>
                Share
              </button>
            )}
          </div>
        )}
      </header>
      
      <main>
        {isFormVisible ? (
          <WishForm onSubmit={addWishItem} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <>
            <WishList items={wishItems} onRemove={isSharedWishlist ? undefined : removeWishItem} />
            {wishItems.length === 0 && (
              <div className="empty-state">
                <p>
                  {isSharedWishlist 
                    ? "This shared wishlist is empty."
                    : "Your wishlist is empty. Tap the main blue button at the bottom of your screen to add items."}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App; 