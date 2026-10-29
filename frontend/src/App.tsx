import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';


// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Services } from './pages/public/Services';
import { Membership } from './pages/public/Membership';
import { Trainers } from './pages/public/Trainers';
import { Gallery } from './pages/public/Gallery';
import { BMICalculator } from './pages/public/BMICalculator';
import { Contact } from './pages/public/Contact';
import { StaffLogin } from './pages/public/StaffLogin';


// Owner Portal Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { MemberManagement } from './pages/owner/MemberManagement';
import { AttendanceManagement } from './pages/owner/AttendanceManagement';
import { PaymentManagement } from './pages/owner/PaymentManagement';
import { EquipmentManagement } from './pages/owner/EquipmentManagement';
import { TrainerManagement } from './pages/owner/TrainerManagement';
import { OwnerReports } from './pages/owner/OwnerReports';
import { OwnerSettings } from './pages/owner/OwnerSettings';
import { Queries } from './pages/owner/Queries';

// Trainer Portal Pages
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { TrainerMembers } from './pages/trainer/TrainerMembers';
import { TrainerAttendance } from './pages/trainer/TrainerAttendance';
import { TrainerProgress } from './pages/trainer/TrainerProgress';


export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/bmi-calculator" element={<BMICalculator />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<StaffLogin />} />

            {/* Owner Protected Routes */}
            <Route element={<ProtectedRoute allowedRole="OWNER" />}>
              <Route path="/admin/dashboard" element={<OwnerDashboard />} />
              <Route path="/admin/members" element={<MemberManagement />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/payments" element={<PaymentManagement />} />
              <Route path="/admin/equipment" element={<EquipmentManagement />} />
              <Route path="/admin/trainers" element={<TrainerManagement />} />
              <Route path="/admin/reports" element={<OwnerReports />} />
              <Route path="/admin/settings" element={<OwnerSettings />} />
              <Route path="/admin/queries" element={<Queries />} />
            </Route>

            {/* Trainer Protected Routes */}
            <Route element={<ProtectedRoute allowedRole="TRAINER" />}>
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
              <Route path="/trainer/members" element={<TrainerMembers />} />
              <Route path="/trainer/attendance" element={<TrainerAttendance />} />
              <Route path="/trainer/progress" element={<TrainerProgress />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

