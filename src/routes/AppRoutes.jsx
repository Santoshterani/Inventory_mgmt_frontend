import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';

import Login from '../pages/Login.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import ChangePassword from '../pages/ChangePassword.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Inventory from '../pages/Inventory.jsx';
import Purchases from '../pages/Purchases.jsx';
import Transfers from '../pages/Transfers.jsx';
import Assignments from '../pages/Assignments.jsx';
import Expenditures from '../pages/Expenditures.jsx';
import UserManagement from '../pages/UserManagement.jsx';
import Bases from '../pages/Bases.jsx';
import EquipmentTypes from '../pages/EquipmentTypes.jsx';

// Wraps a page with auth + role guarding (screenKey) and the shared
// sidebar/navbar shell, with a per-page title in the navbar.
function Page({ screenKey, title, children }) {
  return (
    <ProtectedRoute screenKey={screenKey}>
      <MainLayout title={title}>{children}</MainLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* No screenKey: every authenticated role can reach this, and it's the
          one page ProtectedRoute lets through while mustChangePassword is true. */}
      <Route
        path="/change-password"
        element={
          <Page title="Change Password">
            <ChangePassword />
          </Page>
        }
      />

      <Route
        path="/dashboard"
        element={
          <Page screenKey="dashboard" title="Dashboard">
            <Dashboard />
          </Page>
        }
      />
      <Route
        path="/inventory"
        element={
          <Page screenKey="inventory" title="Inventory">
            <Inventory />
          </Page>
        }
      />
      <Route
        path="/purchases"
        element={
          <Page screenKey="purchases" title="Purchases">
            <Purchases />
          </Page>
        }
      />
      <Route
        path="/transfers"
        element={
          <Page screenKey="transfers" title="Transfers">
            <Transfers />
          </Page>
        }
      />
      <Route
        path="/assignments"
        element={
          <Page screenKey="assignments" title="Assignments">
            <Assignments />
          </Page>
        }
      />
      <Route
        path="/expenditures"
        element={
          <Page screenKey="expenditures" title="Expenditures">
            <Expenditures />
          </Page>
        }
      />
      <Route
        path="/users"
        element={
          <Page screenKey="users" title="User Management">
            <UserManagement />
          </Page>
        }
      />
      <Route
        path="/bases"
        element={
          <Page screenKey="bases" title="Bases">
            <Bases />
          </Page>
        }
      />
      <Route
        path="/equipment-types"
        element={
          <Page screenKey="equipmentTypes" title="Equipment Types">
            <EquipmentTypes />
          </Page>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
