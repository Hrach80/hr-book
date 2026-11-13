import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Գրանցում ենք Service Worker-ը ֆոնային աշխատանքի համար
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);

      // Խնդրում ենք բրաուզերի թույլտվությունը ծանուցումների համար
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      }
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  });
}