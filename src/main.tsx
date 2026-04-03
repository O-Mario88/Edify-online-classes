import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'

localStorage.setItem('maple-auth-user', JSON.stringify({id: 'test', email: 'test', role: 'universal_student', countryCode: 'uganda'}));
localStorage.setItem('maple-auth-profile', JSON.stringify({id: 'test', email: 'test', role: 'universal_student', countryCode: 'uganda'}));
localStorage.setItem('maple-auth-context', 'mixed');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
