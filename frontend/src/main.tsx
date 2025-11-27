import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Clerk Publishable Key. ' +
    'Please create a .env file in the frontend directory with VITE_CLERK_PUBLISHABLE_KEY=pk_test_... ' +
    'Or if using Docker, ensure VITE_CLERK_PUBLISHABLE_KEY is set in the root .env file.'
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
