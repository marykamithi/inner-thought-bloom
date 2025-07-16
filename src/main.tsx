import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/hooks/useTheme'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="inner-thought-bloom-theme">
    <App />
  </ThemeProvider>
);
