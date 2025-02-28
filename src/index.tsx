import React from 'react';
import ReactDOM from 'react-dom/client';
import WebApp from '@twa-dev/sdk';
import App from './App';
import './styles/index.css';

// Function to properly initialize the Telegram WebApp
const initTelegramWebApp = () => {
  try {
    // Initialize Telegram Web App
    WebApp.ready();
    
    // Expand the WebApp to take full height
    if (!WebApp.isExpanded) {
      WebApp.expand();
    }
    
    // Check if we're actually in Telegram
    const isInTelegram = window.Telegram && window.Telegram.WebApp;
    
    if (isInTelegram) {
      console.log('Telegram WebApp initialized successfully');
      return true;
    } else {
      console.warn('Not running in Telegram WebApp environment');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Telegram WebApp:', error);
    return false;
  }
};

// Initialize WebApp
const isWebAppInitialized = initTelegramWebApp();

// Add a small timeout to ensure WebApp is fully initialized
setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // After mounting, try to initialize the MainButton again
  if (isWebAppInitialized) {
    try {
      WebApp.MainButton.setText('Add Wish');
      WebApp.MainButton.show();
    } catch (error) {
      console.error('Error showing MainButton after mount:', error);
    }
  }
}, 100); 