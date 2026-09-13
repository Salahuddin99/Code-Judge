import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import CreateChallenge from './pages/CreateChallenge.tsx'
import SolveChallenge from './pages/SolveChallenge.tsx'
import ViewResults from './pages/ViewResults.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/create" element={<CreateChallenge />} />
        <Route path="/solve/:id" element={<SolveChallenge />} />
        <Route path="/results/:id" element={<ViewResults />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
