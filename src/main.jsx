import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'

// Configure router with future flags to resolve warnings
const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={routerFutureFlags}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)