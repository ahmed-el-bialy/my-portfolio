import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </LanguageProvider>
);
