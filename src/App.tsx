import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthContainer from './pages/Auth/AuthContainer';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import EmailVerifiedSuccess from './components/auth/EmailVerifiedSuccess';
import VacationHub from './pages/properties/VacationHub';
import PropertyDetails from './pages/properties/PropertyDetails';
import SavedProperties from './pages/properties/SavedProperties';
import RoleRoute from './components/auth/RoleRoute';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AgentDashboard from './pages/Dashboard/AgentDashboard';
import LandlordDashboard from './pages/Dashboard/LandlordDashboard';
import CaretakerDashboard from './pages/Dashboard/CaretakerDashboard';
import VerifierDashboard from './pages/Dashboard/VerifierDashboard';
import UserManagement from './pages/Dashboard/UserManagement';
import AddProperty from './pages/properties/AddProperty';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Profile from './pages/Auth/Profile';
import Messages from './pages/Chat/Messages';
import DashboardRedirect from './components/auth/DashboardRedirect';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthContainer />} />
        <Route path="/register" element={<AuthContainer />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedProperties />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        {/* Email verification routes */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verified" element={<EmailVerifiedSuccess />} />

        {/* Home page is now Vacation Hub */}
        <Route path="/" element={<VacationHub />} />
        <Route path="/vacation-hub" element={<Navigate to="/" replace />} />

        <Route
          path="/property/:id"
          element={
            <ProtectedRoute>
              <PropertyDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />
        {/* Dashboard routes */}
        <Route
          path="/dashboard/admin"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/agent"
          element={
            <RoleRoute allowedRoles={['agent']}>
              <AgentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/landlord"
          element={
            <RoleRoute allowedRoles={['landlord']}>
              <LandlordDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/landlord/add-property"
          element={
            <RoleRoute allowedRoles={['landlord']}>
              <AddProperty />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/caretaker"
          element={
            <RoleRoute allowedRoles={['caretaker']}>
              <CaretakerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/verifier"
          element={
            <RoleRoute allowedRoles={['verifier', 'admin']}>
              <VerifierDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/dashboard/users"
          element={
            <RoleRoute allowedRoles={['admin', 'verifier']}>
              <UserManagement />
            </RoleRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1B2430',
            color: '#fff',
            border: '1px solid #2C3A4E',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        }}
      />
    </Router>
  );
}

export default App;