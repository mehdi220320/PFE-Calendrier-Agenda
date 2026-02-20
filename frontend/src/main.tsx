import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import Calendary from './Calendly.tsx'
import ExpertCalendar from './ExpertCalendar.tsx'
// import JitsiTest from './jitsiTest.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExpertCalendar />
  </StrictMode>,
)
