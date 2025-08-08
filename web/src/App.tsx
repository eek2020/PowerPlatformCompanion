import './App.css'
import NavBar from './components/NavBar'
import { Routes, Route, Navigate } from 'react-router-dom'
import SnippetsPage from './pages/SnippetsPage'
import DelegationPage from './pages/DelegationPage'
import FormatterPage from './pages/FormatterPage'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/snippets" replace />} />
        <Route path="/snippets" element={<SnippetsPage />} />
        <Route path="/delegation" element={<DelegationPage />} />
        <Route path="/formatter" element={<FormatterPage />} />
        <Route path="*" element={<main className="container"><h1>Not Found</h1></main>} />
      </Routes>
    </>
  )
}

export default App
