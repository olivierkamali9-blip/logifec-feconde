import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VehiculesListe from './pages/VehiculesListe'
import VehiculeFiche from './pages/VehiculeFiche'
import Administrateurs from './pages/Administrateurs'
import Parametres from './pages/Parametres'
import ScanPublic from './pages/ScanPublic'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/scan/:id" element={<ScanPublic />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="vehicules" element={<VehiculesListe />} />
            <Route path="vehicules/nouveau" element={<VehiculeFiche />} />
            <Route path="vehicules/:id" element={<VehiculeFiche />} />
            <Route path="administrateurs" element={<Administrateurs />} />
            <Route path="parametres" element={<Parametres />} />
          </Route>

          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
