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
  const [showFallbackButton, setShowFallbackButton] = useState(false);

  useEffect(() => {
    // Set Telegram main button for adding a wish
    try {
      WebApp.MainButton.setText('Add Wish');
      WebApp.MainButton.show();
      WebApp.MainButton.onClick(() => setIsFormVisible(true));
      
      // If we can't detect the main button within 1 second, show the fallback
      const timer = setTimeout(() => {
        if (!document.querySelector('.telegram-button')) {
          setShowFallbackButton(true);
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        WebApp.MainButton.hide();
        WebApp.MainButton.offClick();
      };
    } catch (error) {
      console.error('Error initializing Telegram MainButton:', error);
      setShowFallbackButton(true);
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Wishlist</h1>
      </header>
      
      <main>
        {isFormVisible ? (
          <WishForm onSubmit={addWishItem} onCancel={() => setIsFormVisible(false)} />
        ) : (
          <>
            <WishList items={wishItems} onRemove={removeWishItem} />
            {wishItems.length === 0 ? (
              <div className="empty-state">
                <p>Your wishlist is empty. {!showFallbackButton && 'Tap the main blue button at the bottom of your screen to add items.'}</p>
                {showFallbackButton && (
                  <button 
                    className="fallback-add-button" 
                    onClick={() => setIsFormVisible(true)}
                  >
                    Add Wish
                  </button>
                )}
              </div>
            ) : (
              showFallbackButton && (
                <div className="add-button-container">
                  <button 
                    className="fallback-add-button" 
                    onClick={() => setIsFormVisible(true)}
                  >
                    Add Another Wish
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App; 