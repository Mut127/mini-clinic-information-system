import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Registrations from './pages/Registrations';
import Queues from './pages/Queues';
import MedicalRecords from './pages/MedicalRecords';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Polies from './pages/Polies';
import Doctors from './pages/Doctors';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/queues" element={<Queues />} />
            <Route path="/medical-records" element={<MedicalRecords />} />            
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>
          } />
          <Route path="/polies" element={
            <ProtectedRoute allowedRoles={['admin']}><Polies /></ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute allowedRoles={['admin']}><Doctors /></ProtectedRoute>
          } />
            
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;