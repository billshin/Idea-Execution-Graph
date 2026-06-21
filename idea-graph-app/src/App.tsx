import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import IdeaListPage from './pages/IdeaListPage'
import IdeaEditorPage from './pages/IdeaEditorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IdeaListPage />} />
        <Route path="/editor/:projectId" element={<IdeaEditorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
