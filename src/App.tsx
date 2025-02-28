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
      
      if (idFromUrl && dataFromUrl) {
        // Load wishlist from URL data parameter (sharing case)
        try {
          const decodedData = JSON.parse(atob(dataFromUrl));
          setWishItems(decodedData);
          setWishlistId(idFromUrl);
          setIsSharedWishlist(true);
          console.log('Loaded shared wishlist from URL data:', decodedData);
        } catch (e) {
          console.error('Error parsing shared wishlist data:', e);
        }
      } else if (idFromUrl) {
        // This is for backward compatibility
        const savedItems = localStorage.getItem(`wishlist_${idFromUrl}`);
        if (savedItems) {
          setWishItems(JSON.parse(savedItems));
          setWishlistId(idFromUrl);
        } else {
          // If no data found, create new wishlist
          createNewWishlist();
        }
      } else {
        // Create a new wishlist ID if none exists
        createNewWishlist();
      }
    } catch (error) {
      console.error('Error initializing wishlist:', error);
      // Fallback to new wishlist
      createNewWishlist();
    }
  }, []);

  const createNewWishlist = () => {
    const newId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    setWishlistId(newId);
    setIsSharedWishlist(false);
    
    // Load from localStorage if exists
    const savedItems = localStorage.getItem(`wishlist_${newId}`);
    if (savedItems) {
      setWishItems(JSON.parse(savedItems));
    }
  };

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlistId && wishItems.length > 0 && !isSharedWishlist) {
      localStorage.setItem(`wishlist_${wishlistId}`, JSON.stringify(wishItems));
    }
  }, [wishItems, wishlistId, isSharedWishlist]);

  // Handle MainButton visibility and state
  useEffect(() => {
    try {
      // Only manage MainButton if form is not visible
      if (!isFormVisible) {
        if (!isSharedWishlist) {
          WebApp.MainButton.setText('Add Wish');
          WebApp.MainButton.show();
          WebApp.MainButton.onClick(() => setIsFormVisible(true));
        } else {
          WebApp.MainButton.hide();
        }
      } else {
        // Hide MainButton when form is visible
        WebApp.MainButton.hide();
      }
      
      return () => {
        WebApp.MainButton.hide();
        WebApp.MainButton.offClick();
      };
    } catch (error) {
      console.error('Error managing Telegram MainButton:', error);
      return () => {};
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
      
      // Copy to clipboard first
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          console.log('Link copied to clipboard:', shareUrl);
          
          // Then show sharing options
          WebApp.showAlert('Link copied! You can now share it with your friends.');
          
          // Open Telegram sharing after a short delay
          setTimeout(() => {
            try {
              WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my wishlist!')}`);
            } catch (shareError) {
              console.error('Error opening Telegram share:', shareError);
            }
          }, 1500);
        })
        .catch(copyError => {
          console.error('Error copying to clipboard:', copyError);
          // Fallback if clipboard copy fails
          WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my wishlist!')}`);
        });
    } catch (error) {
      console.error('Error sharing wishlist:', error);
      WebApp.showAlert('Error sharing wishlist. Please try again.');
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
                    : "Your wishlist is empty. Tap the blue button at the bottom to add items."}
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