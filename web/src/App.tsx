import './App.css'
import NavBar from './components/NavBar'
import { Routes, Route, Navigate } from 'react-router-dom'
import SnippetsPage from './pages/SnippetsPage'
import DelegationPage from './pages/DelegationPage'
import FormatterPage from './pages/FormatterPage'
import ExpressionPage from './pages/ExpressionPage'
import LicensingPage from './pages/LicensingPage'
import PacksPage from './pages/PacksPage'
import DataversePage from './pages/DataversePage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import ResourcesPage from './pages/ResourcesPage'
import DiagnosticsPage from './pages/DiagnosticsPage'
import RoadmapPage from './pages/RoadmapPage'
import IconsPage from './pages/IconsPage'
import PlanningPage from './pages/PlanningPage'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/snippets" replace />} />
        <Route path="/snippets" element={<SnippetsPage />} />
        <Route path="/delegation" element={<DelegationPage />} />
        <Route path="/formatter" element={<FormatterPage />} />
        <Route path="/expression" element={<ExpressionPage />} />
        <Route path="/licensing" element={<LicensingPage />} />
        <Route path="/packs" element={<PacksPage />} />
        <Route path="/dataverse" element={<DataversePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/diagnostics" element={<DiagnosticsPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/planning" element={<PlanningPage />} />
        <Route path="/icons" element={<IconsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<main className="container"><h1>Not Found</h1></main>} />
      </Routes>
    </>
  )
}

export default App
