import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

// BrowserRouter ermöglicht Navigation zwischen Views (HomeView, GameView, etc.)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
